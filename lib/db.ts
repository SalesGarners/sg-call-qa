import dbConnect from './mongodb';
import Lead from './models/Lead';

/**
 * Database client — migrated to use MongoDB Atlas (via Mongoose).
 * This bridge maintains the exact same API surface as the previous 
 * local server, so no changes are needed in API routes.
 */

export const db = {
  lead: {
    /**
     * Create a new lead in MongoDB
     */
    async create(data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      category: string;
      employeeCount: string;
      jobTitle?: string;
    }) {
      await dbConnect();
      const lead = await Lead.create(data);
      // Convert to a plain object and replace _id with id for frontend consistency
      const obj = lead.toObject();
      return { ...obj, id: obj._id.toString() };
    },

    /**
     * Update an existing lead
     */
    async update(id: string, data: Partial<{
      transcript:     string;
      verdict:        string;
      score:          number;
      reasoning:      string;
      status:         string;
      emailStatus:    string;
      emailStatusRaw: string;
    }>) {
      await dbConnect();
      
      // Map 'verdict' if needed (ensure it matches enum)
      const updateData = { ...data };
      
      const lead = await Lead.findByIdAndUpdate(id, updateData, { new: true });
      if (!lead) return null;
      
      const obj = lead.toObject();
      return { ...obj, id: obj._id.toString() };
    },

    /**
     * Find a single lead by its ID
     */
    async findUnique(id: string) {
      await dbConnect();
      try {
        const lead = await Lead.findById(id);
        if (!lead) return null;
        
        const obj = lead.toObject();
        return { ...obj, id: obj._id.toString() };
      } catch (err) {
        return null;
      }
    },

    /**
     * Delete a lead by its ID
     */
    async delete(id: string) {
      await dbConnect();
      try {
        const lead = await Lead.findByIdAndDelete(id);
        if (!lead) return null;
        const obj = lead.toObject();
        return { ...obj, id: obj._id.toString() };
      } catch (err) {
        return null;
      }
    },

    /**
     * Get all leads sorted by newest first
     */
    async findMany() {
      await dbConnect();
      const leads = await Lead.find({}).sort({ createdAt: -1 });
      return leads.map(l => {
        const obj = l.toObject();
        return { ...obj, id: obj._id.toString() };
      });
    },
  },
};

export default db;
