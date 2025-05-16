export const baseTimestamps = {
  createdAt: { type: Date, default: Date.now },
  createdUpdate: { type: Date },
  createdDelete: { type: Date },
  isDelete: { type: Boolean, default: false }
};
export interface IBaseTimestamps {
    createdAt?: Date;
    createdUpdate?: Date;
    createdDelete?: Date;
    isDelete?: boolean;
  }