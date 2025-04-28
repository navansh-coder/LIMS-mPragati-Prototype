const mongoose = require('mongoose');

const sampleRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true,
    default: function() {
      return 'REQ-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orgId: {
    type: String,
    required: true
  },
  sampleType: {
    type: String,
    enum: ['Metallic', 'Ceramic', 'Polymeric', 'Composite', 'Other'],
    required: true
  },
  sampleDescription: String,
  characterizationType: [{
    type: String,
    enum: [
      'Tension-Static',
      'Compression-Static',
      'Torsional-Static',
      'Tension-Fatigue',
      'Compression-Fatigue',
      'Torsional-Fatigue',
      'MicroCT',
      'Hardness',
      'MicroHardness',
      'SurfaceProfilometry'
    ],
    required: true
  }],
//   equipmentRequired: [{
//     type: String,
//     enum: [
//       'Universal Testing Machine',
//       'Fatigue Testing Machine',
//       'MicroCT Scanner',
//       'Hardness Tester',
//       'Microhardness Tester',
//       'Surface Profilometer'
//     ]
//   }],
  sampleImage: {
    type: String, // URL of trher image wil be store 
    required: false
  },
  numberOfSamples: {
    type: Number,
    required: true,
    min: 1
  },
  icmrProject: {
    isFunded: {
      type: Boolean,
      default: false
    },
    projectNumber: {
      type: String,
      default: 'NA'
    }
  },
  status: {
    type: String,
    enum: ['Submitted', 'In-Review', 'Approved', 'Rejected', 'In-Progress', 'Completed'],
    default: 'Submitted'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});


sampleRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SampleRequest', sampleRequestSchema);