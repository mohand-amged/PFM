'use client';

import { useState } from 'react';
import { X, PiggyBank, Target, Calendar, FileText } from 'lucide-react';

interface SavingsFormData {
  goalName: string;
  targetAmount: string;
  currentAmount: string;
  description: string;
  targetDate: string;
  category: string;
}

interface AddSavingsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (savings: SavingsFormData) => void;
}

const savingsCategories = [
  'Emergency Fund',
  'Vacation',
  'Car Purchase',
  'Home Down Payment',
  'Education',
  'Retirement',
  'Wedding',
  'Electronics',
  'Investment',
  'Other'
];

export default function AddSavingsForm({ isOpen, onClose, onSubmit }: AddSavingsFormProps) {
  const [formData, setFormData] = useState<SavingsFormData>({
    goalName: '',
    targetAmount: '',
    currentAmount: '0',
    description: '',
    targetDate: '',
    category: ''
  });

  const [errors, setErrors] = useState<Partial<SavingsFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof SavingsFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<SavingsFormData> = {};

    if (!formData.goalName.trim()) {
      newErrors.goalName = 'Goal name is required';
    }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }
    if (formData.currentAmount && parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Current amount cannot be negative';
    }
    if (formData.targetAmount && formData.currentAmount && 
        parseFloat(formData.currentAmount) > parseFloat(formData.targetAmount)) {
      newErrors.currentAmount = 'Current amount cannot exceed target amount';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        newErrors.targetDate = 'Target date must be in the future';
      }
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        goalName: '',
        targetAmount: '',
        currentAmount: '0',
        description: '',
        targetDate: '',
        category: ''
      });
      setErrors({});
      onClose();
    }
  };

  const calculateProgress = () => {
    if (!formData.targetAmount || !formData.currentAmount) return 0;
    const target = parseFloat(formData.targetAmount);
    const current = parseFloat(formData.currentAmount);
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <PiggyBank className="w-5 h-5 mr-2 text-green-500" />
            Add Savings Goal
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goal Name *
            </label>
            <input
              type="text"
              name="goalName"
              value={formData.goalName}
              onChange={handleChange}
              placeholder="e.g., Emergency Fund, Vacation"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.goalName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.goalName && <p className="text-sm text-red-500 mt-1">{errors.goalName}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {savingsCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Amount *
            </label>
            <div className="relative">
              <PiggyBank className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.targetAmount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.targetAmount && <p className="text-sm text-red-500 mt-1">{errors.targetAmount}</p>}
          </div>

          {/* Current Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Amount
            </label>
            <div className="relative">
              <PiggyBank className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.currentAmount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.currentAmount && <p className="text-sm text-red-500 mt-1">{errors.currentAmount}</p>}
            {formData.targetAmount && formData.currentAmount && (
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{calculateProgress().toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.targetDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.targetDate && <p className="text-sm text-red-500 mt-1">{errors.targetDate}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your savings goal..."
                rows={3}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Add Savings Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
