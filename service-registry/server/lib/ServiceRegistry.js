const semver = require('semver');


class ServiceRegistry {
  constructor(log) {
    this.log = log;
    this.services = {};
    this.timeout = 30;
  }

  // finds new resource
  get(name, version) {
    this.cleanup();
    const candidates = Object.values(this.services) 
      .filter(service => service.name === name && semver.satisfies(service.version, version));
    // the math.random method below will return a version that doesn't need to match 
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // creates new resource
  register(name, version, ip, port) {
    this.cleanup();
    const key = name + version + ip + port;
    console.log("this is keyyy", key);
    if (!this.services[key]) {
      this.services[key] = {};
      this.services[key].timestamp = Math.floor(new Date() / 1000);
      this.services[key].version = version;
      this.services[key].ip = ip;
      this.services[key].name = name;
      this.services[key].port = port;
      this.log.debug(`Added Services ${name}, version ${version} at ${ip}: ${port}`);
      return key;
    }
    this.services[key].timestamp = Math.floor(new Date() / 1000);
    this.log.debug(`Updated Services ${name}, version ${version} at ${ip}: ${port}`);
    return key;
  }

  // deletes existing resource
  unregister(name, version, ip, port) {
    const key = name + version + ip + port;
    delete this.services[key];
    this.log.debug(`removed ${name}, version ${version}`);
    return key;
  }

  // the cleanup function removes a service after it has not been used for a period of time
  cleanup() {
    const now = Math.floor(new Date() / 1000);
    Object.keys(this.services).forEach((key) => {
      if (this.services[key].timestamp + this.timeout < now) {
        delete this.services[key];
        this.log.debug(`removed ${this.services[key].name}`);
        return key;
      }
    });
  }
}

module.exports = ServiceRegistry;
