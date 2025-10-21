import FinancialSummary from '../models/FinancialSummary.js';

// Get the current user's financial summary
export const getFinancialSummary = async (req, res) => {
  try {
    const summary = await FinancialSummary.findOne({ user: req.user._id });
    
    if (!summary) {
      return res.status(404).json({ message: 'Financial summary not found' });
    }
    
    res.json(summary); 
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}; 

// Create or update the current user's financial summary
export const upsertFinancialSummary = async (req, res) => {
  try {
    const { income, expenses, savings, netWorth } = req.body;
    
    const summary = await FinancialSummary.findOneAndUpdate(
      { user: req.user._id },
      { income, expenses, savings, netWorth },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}; // ✅ ADDED MISSING CLOSING BRACE
