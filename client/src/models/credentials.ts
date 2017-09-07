/**
 * Created by msio on 10/25/16.
 */

export class Credentials {
  email: string;
  password: string;

  constructor(values) {
    this.email = values.email;
    this.password = values.password;
  }
}
