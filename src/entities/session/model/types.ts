export type User = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  locale: string;
  isGuest: boolean;
  verify: boolean;
};
