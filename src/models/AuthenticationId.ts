/**
 * Represents the authentication details returned by Authentication.
 */

export type AuthenticationId = {
  /**
   * The UID of the owner.
   */
  uid: string;

  /**
   * The email of the owner.
   */
  email: string;

  /**
   * The authentication API key.
   */
  token: string;
};
