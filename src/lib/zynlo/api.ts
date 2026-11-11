/**
 * CRM calls go through the server. The browser never talks to Firebase.
 */
export {
  deleteAgent,
  deleteCall,
  deleteClient,
  deleteCustomer,
  deleteMessage,
  getAllData,
  listAgentNames,
  mergeCustomers,
  resumeSession,
  saveAgent,
  saveCall,
  saveClient,
  saveCustomer,
  saveMessage,
  signInAgent,
  signOutAgent,
  whoAmI,
} from "./server";
