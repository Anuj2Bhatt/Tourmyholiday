class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(message, data = null) {
    return new ApiResponse(true, message, data);
  }

  static error(message, data = null) {
    return new ApiResponse(false, message, data);
  }
}

module.exports = { ApiResponse }; 