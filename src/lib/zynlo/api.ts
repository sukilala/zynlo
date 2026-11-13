/**
 * CRM calls go through the server. The browser never talks to Firebase.
 * The signed-in agent is the email on the Cloudflare Access JWT.
 */
export {
  deleteAgent,
  deleteCall,
  deleteClient,
  deleteCustomer,
  deleteMessage,
  getAllData,
  mergeCustomers,
  saveAgent,
  saveCall,
  saveClient,
  saveCustomer,
  saveMessage,
  whoAmI,
} from "./server";
