/**
 * Storage Service with Hybrid MongoDB / In-Memory Fallback
 * Ensures full zero-crash resilience whether MongoDB is running locally,
 * on Atlas, or running in an isolated developer sandbox environment.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const logger = require('../utils/logger');

// In-memory fallback collections
const memUsers = new Map();
const memAnalyses = new Map();

function isMongoActive() {
  return mongoose.connection.readyState === 1;
}

const storageService = {
  // --- USER OPERATIONS ---
  async findUserByEmail(email, includePassword = false) {
    const normalized = email.toLowerCase().trim();
    if (isMongoActive()) {
      const q = User.findOne({ email: normalized });
      if (includePassword) q.select('+password');
      return await q.exec();
    }

    // In-memory lookup
    for (const u of memUsers.values()) {
      if (u.email === normalized) {
        // Return object with comparePassword method
        return {
          ...u,
          comparePassword: async (candidate) => bcrypt.compare(candidate, u.password),
          toSafeObject: () => {
            const copy = { ...u };
            delete copy.password;
            return copy;
          },
        };
      }
    }
    return null;
  },

  async findUserById(id) {
    if (isMongoActive()) {
      return await User.findById(id).exec();
    }
    const u = memUsers.get(String(id));
    if (!u) return null;
    return {
      ...u,
      toSafeObject: () => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      },
    };
  },

  async createUser({ name, email, password, headline = '' }) {
    const normalized = email.toLowerCase().trim();

    if (isMongoActive()) {
      const user = new User({ name, email: normalized, password, headline });
      await user.save();
      return user.toSafeObject();
    }

    // In-memory creation
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = new mongoose.Types.ObjectId().toString();

    const newUser = {
      _id: id,
      name,
      email: normalized,
      password: hashedPassword,
      headline,
      privacyConsent: {
        acceptedAt: new Date(),
        retentionPolicyAccepted: true,
        allowAnonymousBenchmarking: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memUsers.set(id, newUser);
    const safe = { ...newUser };
    delete safe.password;
    return safe;
  },

  async updateUser(id, updates) {
    if (isMongoActive()) {
      return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    }
    const u = memUsers.get(String(id));
    if (!u) return null;
    const updated = { ...u, ...updates, updatedAt: new Date() };
    memUsers.set(String(id), updated);
    const safe = { ...updated };
    delete safe.password;
    return safe;
  },

  async deleteUser(id) {
    if (isMongoActive()) {
      await Promise.all([
        User.findByIdAndDelete(id),
        Analysis.deleteMany({ user: id }),
      ]);
      return true;
    }
    memUsers.delete(String(id));
    for (const [aId, a] of memAnalyses.entries()) {
      if (String(a.user) === String(id)) {
        memAnalyses.delete(aId);
      }
    }
    return true;
  },

  // --- ANALYSIS OPERATIONS ---
  async createAnalysis(data) {
    if (isMongoActive()) {
      const record = new Analysis(data);
      return await record.save();
    }

    const id = new mongoose.Types.ObjectId().toString();
    const created = {
      _id: id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memAnalyses.set(id, created);
    return created;
  },

  async getAnalysesByUser(userId, { search = '', sort = 'desc' } = {}) {
    if (isMongoActive()) {
      const q = { user: userId };
      if (search) {
        q.$or = [
          { jobTitle: { $regex: search, $options: 'i' } },
          { jobCompany: { $regex: search, $options: 'i' } },
        ];
      }
      return await Analysis.find(q)
        .sort({ createdAt: sort === 'asc' ? 1 : -1 })
        .lean();
    }

    let list = Array.from(memAnalyses.values()).filter(
      (a) => String(a.user) === String(userId)
    );

    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.jobTitle && a.jobTitle.toLowerCase().includes(term)) ||
          (a.jobCompany && a.jobCompany.toLowerCase().includes(term))
      );
    }

    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === 'asc' ? timeA - timeB : timeB - timeA;
    });

    return list;
  },

  async getAnalysisById(id, userId) {
    if (isMongoActive()) {
      return await Analysis.findOne({ _id: id, user: userId }).lean();
    }
    const found = memAnalyses.get(String(id));
    if (!found || String(found.user) !== String(userId)) {
      return null;
    }
    return found;
  },

  async deleteAnalysis(id, userId) {
    if (isMongoActive()) {
      const res = await Analysis.findOneAndDelete({ _id: id, user: userId });
      return !!res;
    }
    const found = memAnalyses.get(String(id));
    if (!found || String(found.user) !== String(userId)) {
      return false;
    }
    memAnalyses.delete(String(id));
    return true;
  },

  async clearUserAnalyses(userId) {
    if (isMongoActive()) {
      const res = await Analysis.deleteMany({ user: userId });
      return res.deletedCount;
    }
    let count = 0;
    for (const [id, a] of memAnalyses.entries()) {
      if (String(a.user) === String(userId)) {
        memAnalyses.delete(id);
        count++;
      }
    }
    return count;
  },
};

module.exports = storageService;
