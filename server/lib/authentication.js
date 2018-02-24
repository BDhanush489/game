const axios = require('axios');
const Socket = require('./../socket');
const world = require('./../core/world');

class Authentication {
  /**
   * Log the player in, get the JWT token and then their profile
   *
   * @param {object} data The username/password sent to the login endpoint
   * @returns {object} Their player profile and token
   */
  static async login(data) {
    return new Promise(async (resolve) => {
      const token = await Authentication.getToken(data.data);
      const player = await Authentication.getProfile(token);

      resolve({ player, token });
    });
  }

  /**
   * Logs the player in and returns their JWT token
   *
   * @param {object} data The player credentials
   */
  static getToken(data) {
    const url = `${process.env.SITE_URL}/api/auth/login`;

    return new Promise((resolve) => {
      axios
        .post(url, data)
        .then(r => resolve(r.data.access_token));
    });
  }

  /**
   * Gets the player profile upon login
   *
   * @param {string} token Their JWT authentication token
   */
  static getProfile(token) {
    const url = `${process.env.SITE_URL}/api/auth/me`;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    return new Promise((resolve) => {
      axios
        .post(url, null, config)
        .then(r => resolve(r.data));
    });
  }

  /**
   * Logs the player out and saves the data.
   *
   * @param {string} token Their JWT authentication token
   */
  static async logout(token) {
    const url = `${process.env.SITE_URL}/api/auth/logout`;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    return new Promise((resolve) => {
      axios
        .post(url, null, config)
        .then(r => resolve(r.data));
    });
  }

  /**
   * Adds the player to world and logs them in
   *
   * @param {object} player The player who has just joined the server
   */
  static addPlayer(player) {
    // Add the player
    world.players.push(player);

    const block = {
      player,
      map: world.map,
      npcs: world.npcs,
      droppedItems: world.items,
    };

    // Tell the client they are logging in
    Socket.emit('player:login', block);

    // Tell the world someone logged in
    Socket.broadcast('player:joined', world.players);
  }
}

module.exports = Authentication;