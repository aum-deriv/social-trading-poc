interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  userType: "leader" | "copier";
  followers: string[]; // Array of user IDs
  following: string[]; // Array of user IDs
  accounts: string[]; // Array of account IDs
  createdAt: string;
  updatedAt: string;
}

export default User;
