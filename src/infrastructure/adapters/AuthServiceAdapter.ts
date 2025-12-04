import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface UserData {
  names: string;
  firstLastName: string;
  secondLastName: string;
  email: string;
  phoneNumber: string;
}

export class AuthServiceAdapter {
  private authUrl: string;

  constructor() {
    this.authUrl = process.env.AUTH_SERVICE_URL || '';
  }

  async getUserData(userId: string, token: string): Promise<UserData | null> {
    try {
      const response = await axios.get(`${this.authUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.data) {
        const user = response.data.data;
        
        return {
          names: user.names,
          firstLastName: user.firstLastName,
          secondLastName: user.secondLastName || '',
          email: user.email,
          phoneNumber: user.phoneNumber || ''
        };
      }

      return null;

    } catch (error) {
      console.error('Error comunicando con Auth Service:', error);
      return null;
    }
  }
}