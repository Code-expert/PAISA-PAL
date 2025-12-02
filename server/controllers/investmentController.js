import Investment from '../models/Investment.js';
import catchAsync from '../Middleware/catchAsync.js';
import logger from '../utils/logger.js';

export const getInvestments = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = { user: req.user.id };
  if (type) filter.type = type;
  
  const investments = await Investment.find(filter)
    .sort({ purchaseDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await Investment.countDocuments(filter);
  
  // Calculate portfolio value
  const portfolioValue = investments.reduce((sum, inv) => {
    return sum + (inv.quantity * (inv.currentPrice || inv.purchasePrice));
  }, 0);
  
  const totalInvested = investments.reduce((sum, inv) => {
    return sum + (inv.quantity * inv.purchasePrice);
  }, 0);
  
  const gainLoss = portfolioValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
  
  res.json({ 
    success: true, 
    investments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    summary: {
      portfolioValue,
      totalInvested,
      gainLoss,
      gainLossPercentage
    }
  });
});

export const createInvestment = catchAsync(async (req, res) => {
  const { name, symbol, quantity, purchasePrice, currentPrice, type, purchaseDate } = req.body;
  
  // Validate required fields
  if (!name || !symbol || !quantity || !purchasePrice || !type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name, symbol, quantity, purchase price, and type are required' 
    });
  }
  
  // Validate numeric fields
  if (isNaN(quantity) || parseFloat(quantity) <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Quantity must be a positive number' 
    });
  }
  
  if (isNaN(purchasePrice) || parseFloat(purchasePrice) <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Purchase price must be a positive number' 
    });
  }
  
  if (currentPrice && (isNaN(currentPrice) || parseFloat(currentPrice) < 0)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Current price must be a non-negative number' 
    });
  }
  
  const investment = await Investment.create({ 
    ...req.body, 
    user: req.user.id,
    quantity: parseFloat(quantity),
    purchasePrice: parseFloat(purchasePrice),
    currentPrice: currentPrice ? parseFloat(currentPrice) : parseFloat(purchasePrice)
  });
  
  logger.info(`Investment created: ${investment.name} (${investment.symbol})`, {
    userId: req.user.id,
    investmentId: investment._id
  });
  
  res.status(201).json({ success: true, investment });
});

export const getInvestment = catchAsync(async (req, res) => {
  const investment = await Investment.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });
  
  if (!investment) {
    return res.status(404).json({ 
      success: false, 
      message: 'Investment not found or unauthorized' 
    });
  }
  
  res.json({ success: true, investment });
});

export const updateInvestment = catchAsync(async (req, res) => {
  // Validate numeric fields if provided
  if (req.body.quantity !== undefined) {
    if (isNaN(req.body.quantity) || parseFloat(req.body.quantity) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be a positive number' 
      });
    }
    req.body.quantity = parseFloat(req.body.quantity);
  }
  
  if (req.body.purchasePrice !== undefined) {
    if (isNaN(req.body.purchasePrice) || parseFloat(req.body.purchasePrice) <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Purchase price must be a positive number' 
      });
    }
    req.body.purchasePrice = parseFloat(req.body.purchasePrice);
  }
  
  if (req.body.currentPrice !== undefined) {
    if (isNaN(req.body.currentPrice) || parseFloat(req.body.currentPrice) < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current price must be a non-negative number' 
      });
    }
    req.body.currentPrice = parseFloat(req.body.currentPrice);
  }
  
  const investment = await Investment.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!investment) {
    return res.status(404).json({ 
      success: false, 
      message: 'Investment not found or unauthorized' 
    });
  }
  
  logger.info(`Investment updated: ${investment.name}`, {
    userId: req.user.id,
    investmentId: investment._id
  });
  
  res.json({ success: true, investment });
});

export const deleteInvestment = catchAsync(async (req, res) => {
  const investment = await Investment.findOneAndDelete({ 
    _id: req.params.id, 
    user: req.user.id 
  });
  
  if (!investment) {
    return res.status(404).json({ 
      success: false, 
      message: 'Investment not found or unauthorized' 
    });
  }
  
  logger.info(`Investment deleted: ${investment.name}`, {
    userId: req.user.id,
    investmentId: investment._id
  });
  
  res.json({ 
    success: true, 
    message: 'Investment deleted successfully' 
  });
});