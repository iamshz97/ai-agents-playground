export type AuthStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  ProfileSetup: undefined;
  Dashboard: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;

