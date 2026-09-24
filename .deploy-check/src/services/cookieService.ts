// Cookie utility for session management
export class CookieService {
  private static readonly COOKIE_EXPIRY_DAYS = 30;

  static setCookie(
    name: string,
    value: string,
    days: number = this.COOKIE_EXPIRY_DAYS,
  ): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const path = "path=/zoro";
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; ${path}; SameSite=Lax`;
  }

  static getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }

  static removeCookie(name: string): void {
    this.setCookie(name, "", -1);
  }

  static clearAuthCookies(): void {
    this.removeCookie("zoro_auth_token");
    this.removeCookie("zoro_user_email");
    this.removeCookie("zoro_user_id");
  }
}
