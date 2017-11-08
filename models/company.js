const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var Schema = mongoose.Schema;

var CompanySchema = new mongoose.Schema({
  // basic intro
  avatar: { type: String, trim: true, default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMEAAADBCAYAAAB2QtScAAAEHElEQVR42u3dS27iQBRA0ex/S/wbCBgy5yMgsAjGtJ4lpKilplwYYuKcwZ05Dxeq0z0p7LePj4+L9Jt78yUIAl+CIPAlCAJfhCCQIJAgkCCQIJAgkCCQIJAgkCCQIJAgkCCQIJAgkCCQIJAgkCCQIJAgkCCQIJAgkCCQIJAgkCCQIJAgkCCQIJAgkCCQIGi28/ncymxACCq1XC5biyDWZhNCkKyYF61FEGuzCSFI9v7+3loEsTabEAIIbEIIILAJIYBAEEAgCCAQBBAIAggEAQSCAAJBAIEggEAQQCAIIBAEEAgCCAQBBIIAAkEAgSCAQBBAIAggEAQQCAIIBAEEggACQQCBILgTQafTqVyTMyGA4GkIBoPBZTQaJYvrmpwJAQRPQzAejy/T6bT8u1vFdTkzU/PiM3NmQgDB0xDE9YvF4qFzq2zW+Mx77tUmhAACmxACCGxCCCAQBBAIAggEAQSCAAJB4OyQIIBAEEAgCCAQBBAIAggEAQSCAAJBAIEgqI1gvV5XrsmZ/yI4nU6tbLVaQfDdCPr9fvlb31RxXZMzvyJYLpet/d/ueDxC8N0I4gfv8VvfyWRys7guZ2ZqXnxmzswrggDQZgSfn58QNHWA7rq5/lfuAbrUvHsP0MXfFvOitQgOh0O5RgicIv21CPb7PQQQQAABBBBAAAEEEEAAAQQQQAABBBBA4OwQBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEz0bQ6/XK+onimpyZVeblzKyDYLPZJO/nek9x7aNnQvDiCH7ay7zvQbDdbivdz3A4LK999EwIXhxBvFS7KIryQNut4rqcmal58Zk5M+sgiI2Vup9oNpuV1z56JgROkTZ+irTqxoq5OQhSM595rxBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQODskLNDEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEENRA0Ol0KtfkzDoI4qXhVe+n6gvGc2ZC4DfGfmMMwWsjiJdqx2994+9uFdflzEzNi8/MmVkHwW63S95PFC8Zj2sfPRMCB+gcoIMAAggggAACCCCAAAIIIIAAAggggAACCCCAAAJnh5wdggACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggAACCCCAAAIIIIAAAggggOC5COJRH91uN+v5P69crCXW9BVBPK6l16I1RrGmeDoFBDWLDRKPM6nyTJyfVKwp1hYbJI5hx2b507I1xppms9nl1ffYyyO4/ktZ5Zk4P6krgOsa5/N5uWHatMZY06JYQCBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgQSBBIEEgNdpfeJT2c6mzGx4AAAAASUVORK5CYII=' },
  name: { type: String, trim: true },
  country: { type: String, trim: true },
  introduction: { type: String, trim: true, default: 'Your company introduction.' },
  activities: [{ type: Schema.ObjectId, ref: 'Activity' }],
  businesses: [{ type: Schema.ObjectId, ref: 'Business' }],
  // contact info
  email: {
    type: String, required: true, trim: true, minlength: 3, unique: true,
    validate: {
      validator: value => validator.isEmail(value),
      message: '{VALUE} is not a valid email'
    }
  },
  phone: { type: String, trim: true },
}, {
  timestamps: true,
  retainKeyOrder: true
});

var Company = mongoose.model('Company', CompanySchema);

module.exports = { Company };
