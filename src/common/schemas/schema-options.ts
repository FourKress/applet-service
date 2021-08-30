export const SchemaOptions = {
  toJSON: {
    transform: (doc, converted) => {
      converted.id = converted._id.toHexString();
      delete converted._id;
      delete converted.__v;
    },
  },
  timestamps: {
    createdAt: true,
    updatedAt: true,
    currentTime: () => Math.floor(Date.now() / 1000),
  },
};
