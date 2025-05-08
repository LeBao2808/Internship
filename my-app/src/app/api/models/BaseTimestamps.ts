export const baseTimestamps = {
  createdAt: { type: Date, default: Date.now },
  createdUpdate: { type: Date },
  createdDelete: { type: Date }
};
export interface IBaseTimestamps {
    createdAt?: Date;
    createdUpdate?: Date;
    createdDelete?: Date;
  }