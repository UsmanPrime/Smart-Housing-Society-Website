import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class TokenService {
  // Generate device fingerprint from request
  static generateFingerprint(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    
    return crypto
      .createHash('sha256')
      .update(userAgent + ip)
      .digest('hex');
  }
  
  // Generate access token (short-lived)
  static generateAccessToken(user, req) {
    const fingerprint = this.generateFingerprint(req);
    
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        fingerprint,
        type: 'access'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h', // 1 hour
        issuer: 'smart-housing',
        audience: 'smart-housing-users'
      }
    );
  }
  
  // Generate refresh token (long-lived)
  static generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, // Fallback to JWT_SECRET if refresh not set
      {
        expiresIn: '7d', // 7 days
        issuer: 'smart-housing',
        audience: 'smart-housing-users'
      }
    );
  }
  
  // Verify access token with fingerprint validation
  static verifyAccessToken(token, req) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'smart-housing',
        audience: 'smart-housing-users'
      });
      
      // Skip fingerprint validation in production (proxy/load balancer issues)
      if (process.env.NODE_ENV !== 'production') {
        const currentFingerprint = this.generateFingerprint(req);
        if (decoded.fingerprint && decoded.fingerprint !== currentFingerprint) {
          throw new Error('Token fingerprint mismatch - possible token theft');
        }
      }
      
      // Verify token type
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      throw error;
    }
  }
  
  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret, {
        issuer: 'smart-housing',
        audience: 'smart-housing-users'
      });
      
      // Verify token type
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      throw error;
    }
  }
  
  // Generate both tokens
  static generateTokenPair(user, req) {
    return {
      accessToken: this.generateAccessToken(user, req),
      refreshToken: this.generateRefreshToken(user)
    };
  }
}
