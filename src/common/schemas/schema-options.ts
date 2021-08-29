export const SchemaOptions = {
  toJSON: {
    transform: (doc, converted) => {
      converted.id = converted._id;
      delete converted._id;
      delete converted.__v;
    },
  },
  timestamps: true,
};
