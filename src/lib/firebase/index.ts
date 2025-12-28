// Firebase services barrel export
export { db, auth, storage } from './config';

// Auth service
export {
  signIn,
  signUp,
  signInWithGoogle,
  logOut,
  resetPassword,
  subscribeToAuth,
  getCurrentUser,
  type AuthUser,
} from './auth-service';

// Pages service
export {
  getPages,
  getPage,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  publishPage,
  unpublishPage,
} from './pages-service';

// Leads service
export {
  addLead,
  getLeads,
  getLeadsByPage,
  deleteLead,
} from './leads-service';

// Storage service
export {
  uploadImage,
  uploadBase64Image,
  deleteImage,
  listImages,
} from './storage-service';
