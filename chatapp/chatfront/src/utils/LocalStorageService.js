const LocalStorageService = (function () {
  var _service;
  function _getService() {
    if (!_service) {
      _service = this;
      return _service;
    }
    return _service;
  }
  function _setToken(tokenObj) {
    localStorage.setItem("accessToken", tokenObj.accessToken);
    localStorage.setItem("refreshToken", tokenObj.refreshToken);
  }
  function _getAccessToken() {
    return localStorage.getItem("accessToken");
  }
  function _getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }
  function _clearToken() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
  return {
    getService: _getService,
    setToken: _setToken,
    getAccessToken: _getAccessToken,
    getRefreshToken: _getRefreshToken,
    clearToken: _clearToken,
  };
})();
export default LocalStorageService;
