import { useState, useEffect, createContext, useContext } from "react";
import { getUser } from "@/lib/storage.js";
import { apiRequest } from "@/lib/api.js";

const translations = {
  "English (US)": {
    // Common
    "greeting.morning": "Good Morning",
    "greeting.afternoon": "Good Afternoon",
    "greeting.evening": "Good Evening",
    "search_placeholder": "Search...",
    "back_to_dashboard": "Back to Dashboard",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "edit": "Edit",
    "delete": "Delete",
    "yes": "Yes",
    "no": "No",
    "got_it": "Got it",
    "login": "Login",
    "sign_up": "Sign Up",
    
    // Homepage
    "ready_to_create": "Ready to create a new form today?",
    "ignite_project": "Ignite a new project",
    "start_blank": "Start with a blank form.",
    "create_now": "Create Now →",
    "no_forms": "No forms found",
    "view_public": "View Public",
    "my_profile": "My Profile",
    "settings": "Settings",
    "logout": "Logout",
    "all": "All",
    "today": "Today",
    "yesterday": "Yesterday",
    "2days": "2 Days ago",
    "name": "Name",
    "last_opened": "Last Opened",
    "delete_form": "Delete Form",
    "delete_form_confirm": "Are you sure you want to delete this form? All responses will be permanently removed. This action cannot be undone.",
    "form_deleted": "Form deleted successfully",
    "form_delete_failed": "Failed to delete form",
    "empty_today": "It's so quiet today... You haven't touched any forms yet. Let's start one!",
    "empty_yesterday": "Did you take a break yesterday? No form traces found.",
    "empty_2days": "Two days ago was empty. Time to fill the void?",
    
    // Login Page
    "welcome_back": "Welcome Back!",
    "sign_in_subtitle": "Sign in to continue and access your account.",
    "email": "Email",
    "password": "Password",
    "forgot_password": "Forgot password?",
    "signing_in": "Signing In...",
    "sign_in": "Sign In",
    "or": "OR",
    "sign_in_google": "Sign in with Google",
    "no_account": "Don't have an account?",
    "register": "Register",
    "login_success": "Login successful",
    "email_invalid": "Email format is incorrect",
    "password_required": "Password is required",
    "login_failed": "Login failed. Please try again.",
    "account_not_registered": "Account not registered. Please register first.",
    "incorrect_credentials": "Incorrect email or password.",
    
    // Register Page
    "create_account": "Create an Account",
    "register_subtitle": "Join us today and start your journey with a new account.",
    "full_name": "Full Name",
    "email_address": "Email address",
    "new_password": "New password",
    "confirm_password": "Confirm Password",
    "password_hint": "Min. 8 characters, capital letters, numbers & symbols.",
    "weak_password": "Weak password",
    "medium_password": "Medium password",
    "strong_password": "Strong password",
    "registering": "Mendaftarkan...",
    "have_account": "Already have an account?",
    "name_min_3": "Nama minimal 3 karakter",
    "email_not_valid": "Email tidak valid",
    "password_min_8": "Password minimal 8 karakter",
    "password_must_contain": "Password harus mengandung huruf kapital, angka, dan simbol.",
    "password_not_match": "Password dan konfirmasi tidak sama",
    "account_created": "Account created successfully! You can now sign in.",
    "registration_failed": "Registration failed",
    "error_occurred": "An error occurred. Please try again.",
    
    // Profile Page
    "my_profile_title": "My Profile",
    "profile_picture": "Profile Picture",
    "profile_details": "Profile Details",
    "full_name_label": "Full Name",
    "email_label": "Email Address",
    "email_cannot_change": "*Email address cannot be changed.",
    "edit_profile": "Edit Profile",
    "change_password": "Change Password",
    "save_changes": "Save Changes",
    "saving": "Saving...",
    "member_since": "Member since",
    "status": "Status",
    "active": "Active",
    "name_cannot_empty": "Name cannot be empty",
    "profile_updated": "Profile updated successfully!",
    "profile_update_failed": "Failed to update profile",
    "upload_image": "Please upload an image file",
    "image_size_limit": "Image size must be less than 5MB",
    "profile_picture_updated": "Profile picture updated!",
    "image_upload_failed": "Failed to upload image",
    "verification_code_sent": "Verification code sent to your email!",
    "sending_code": "Sending Code...",
    "enter_full_name": "Enter your full name",
    
    // Settings Page
    "settings_title": "Settings",
    "notifications": "Notifications",
    "display_language": "Display & Language",
    "advanced_account": "Advanced Account",
    "notification_settings": "Notification Settings",
    "email_notifications": "Email Notifications",
    "email_notifications_desc": "Receive email every time someone submits a form.",
    "weekly_analytics": "Weekly Form Analytics",
    "weekly_analytics_desc": "Get a weekly summary of your form performances.",
    "dashboard_layout": "Dashboard Layout",
    "list_view": "List View",
    "grid_view": "Grid View",
    "app_language": "App Language",
    "advanced_account_actions": "Advanced Account Actions",
    "deactivate_account": "Deactivate Your Account",
    "deactivate_account_desc": "Temporarily hide your forms and profile. You can come back anytime.",
    "deactivate": "Deactivate",
    "delete_account_permanent": "Delete Account Permanently",
    "delete_account_desc": "This will erase all your forms and data forever. This action is irreversible.",
    "delete_account": "Delete Account",
    "setting_updated": "Setting updated",
    "update_failed": "Failed to update",
    "deactivate_confirm_title": "Deactivate Account?",
    "deactivate_confirm_msg": "Are you sure you want to deactivate your account? Your forms will be hidden until you log back in.",
    "delete_confirm_title": "Delete Account Permanently?",
    "delete_confirm_msg": "This action cannot be undone. All your forms, responses, and data will be permanently deleted.",
    "account_deactivated": "Account deactivated successfully",
    "account_deleted": "Account deleted successfully",
    "deactivate_failed": "Failed to deactivate account",
    "delete_failed": "Failed to delete account",
    
    // OTP Page
    "forgot_password_title": "Forgot Password?",
    "forgot_password_subtitle": "Don't worry! Enter your email below to receive a verification code.",
    "enter_email": "Enter your email",
    "sending_code_btn": "Sending Code...",
    "send_reset_link": "Send Reset Link",
    "return_to_signin": "Return to Sign In",
    "return_to_profile": "Return to Profile",
    "check_mail": "Check Your Mail",
    "sent_code_to": "We've sent a 6-digit code to",
    "verify_identity": "Verify Identity",
    "verifying": "Verifying...",
    "didnt_receive": "Didn't receive the code?",
    "resend_code": "Resend Code",
    "sending": "Sending...",
    "use_different_email": "Use a different email address",
    "otp_sent": "OTP code was sent to your email.",
    "otp_resent": "OTP code was resent.",
    "otp_invalid": "Email tidak valid",
    "otp_send_failed": "Gagal mengirim OTP",
    "enter_6_digits": "Masukkan 6 digit kode OTP",
    "otp_verified": "OTP verified! Redirecting...",
    "email_not_found": "Email tidak ditemukan",
    
    // Reset Password Page
    "new_password_title": "New Password",
    "new_password_subtitle": "Create a strong password to secure your account.",
    "update_password": "Update Password",
    "updating": "Updating...",
    "back_to_signin": "Back to Sign In",
    "back_to_profile": "Back to Profile",
    "password_changed": "Your password has been changed successfully",
    "reset_failed": "Reset password gagal",
    "email_otp_invalid": "Email atau OTP tidak valid.",
    "email_otp_not_found": "Email atau OTP tidak ditemukan.",
    
    // Logout Modal
    "logout_title": "Logout Your Account?",
    "logout_confirm": "Are you sure you want to logout?",
    
    // Popup
    "success": "Success!",
    "are_you_sure": "Are you sure?",
    "attention": "Attention",
    "yes_delete": "Yes, delete it",

    // Landing Page
    "hero_title_1": "Create, Share, and",
    "hero_title_2": "Analyze Forms",
    "hero_title_3": "with Ease",
    "hero_subtitle": "Arphatra is the next generation form builder designed for modern teams.",
    "get_started": "Get Started for Free",
    "feature_1_title": "Intuitive Builder",
    "feature_1_desc": "Drag and drop interface that anyone can master in minutes. No coding required.",
    "feature_2_title": "Custom Themes",
    "feature_2_desc": "Make your forms look exactly how you want with our powerful theme customization.",
    "feature_3_title": "Real-time Analytics",
    "feature_3_desc": "Analyze your responses with beautiful built-in charts and export data easily.",
    "privacy": "Privacy",
    "terms": "Terms",
    "contact": "Contact",
    "all_rights": "All rights reserved.",

    // View Form
    "loading_form": "Loading Form...",
    "form_not_found": "Form not found",
    "submit_required_alert": "Please answer all required questions.",
    "submit_success": "Response submitted successfully!",
    "submit_failed": "Failed to submit",
    "clear_form": "Clear Form",
    "form_cleared_msg": "Form cleared",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "page_of": "Page {current} of {total}"
  },
  "Bahasa Indonesia": {
    // Common
    "greeting.morning": "Selamat Pagi",
    "greeting.afternoon": "Selamat Siang",
    "greeting.evening": "Selamat Malam",
    "search_placeholder": "Cari...",
    "back_to_dashboard": "Kembali ke Dashboard",
    "cancel": "Batal",
    "confirm": "Konfirmasi",
    "save": "Simpan",
    "edit": "Ubah",
    "delete": "Hapus",
    "yes": "Ya",
    "no": "Tidak",
    "got_it": "Mengerti",
    "login": "Masuk",
    "sign_up": "Daftar",
    
    // Homepage
    "ready_to_create": "Siap membuat form baru hari ini?",
    "ignite_project": "Mulai proyek baru",
    "start_blank": "Mulai dengan form kosong.",
    "create_now": "Buat Sekarang →",
    "no_forms": "Tidak ada form ditemukan",
    "view_public": "Lihat Publik",
    "my_profile": "Profil Saya",
    "settings": "Pengaturan",
    "logout": "Keluar",
    "all": "Semua",
    "today": "Hari Ini",
    "yesterday": "Kemarin",
    "2days": "2 Hari Lalu",
    "name": "Nama",
    "last_opened": "Terakhir Dibuka",
    "delete_form": "Hapus Form",
    "delete_form_confirm": "Apakah Anda yakin ingin menghapus form ini? Semua respons akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
    "form_deleted": "Form berhasil dihapus",
    "form_delete_failed": "Gagal menghapus form",
    "empty_today": "Hening sekali hari ini... Belum ada form yang kamu sentuh. Yuk, mulai satu!",
    "empty_yesterday": "Kemarin sepertinya kamu beristirahat ya? Tidak ada jejak form ditemukan.",
    "empty_2days": "Dua hari lalu masih kosong melompong. Waktunya mengisi kekosongan ini?",
    
    // Login Page
    "welcome_back": "Selamat Datang Kembali!",
    "sign_in_subtitle": "Masuk untuk melanjutkan dan mengakses akun Anda.",
    "email": "Email",
    "password": "Kata Sandi",
    "forgot_password": "Lupa kata sandi?",
    "signing_in": "Masuk...",
    "sign_in": "Masuk",
    "or": "ATAU",
    "sign_in_google": "Masuk dengan Google",
    "no_account": "Belum punya akun?",
    "register": "Daftar",
    "login_success": "Login berhasil",
    "email_invalid": "Format email salah",
    "password_required": "Kata sandi wajib diisi",
    "login_failed": "Login gagal. Silakan coba lagi.",
    "account_not_registered": "Akun belum terdaftar. Silakan daftar terlebih dahulu.",
    "incorrect_credentials": "Email atau kata sandi salah.",
    
    // Register Page
    "create_account": "Buat Akun",
    "register_subtitle": "Bergabunglah dengan kami hari ini dan mulai perjalanan Anda dengan akun baru.",
    "full_name": "Nama Lengkap",
    "email_address": "Alamat email",
    "new_password": "Kata sandi baru",
    "confirm_password": "Konfirmasi Kata Sandi",
    "password_hint": "Min. 8 karakter, huruf kapital, angka & simbol.",
    "weak_password": "Kata sandi lemah",
    "medium_password": "Kata sandi sedang",
    "strong_password": "Kata sandi kuat",
    "registering": "Mendaftarkan...",
    "have_account": "Sudah punya akun?",
    "name_min_3": "Nama minimal 3 karakter",
    "email_not_valid": "Email tidak valid",
    "password_min_8": "Kata sandi minimal 8 karakter",
    "password_must_contain": "Kata sandi harus mengandung huruf kapital, angka, dan simbol.",
    "password_not_match": "Kata sandi dan konfirmasi tidak sama",
    "account_created": "Akun berhasil dibuat! Anda sekarang dapat masuk.",
    "registration_failed": "Pendaftaran gagal",
    "error_occurred": "Terjadi kesalahan. Silakan coba lagi.",
    
    // Profile Page
    "my_profile_title": "Profil Saya",
    "profile_picture": "Foto Profil",
    "profile_details": "Detail Profil",
    "full_name_label": "Nama Lengkap",
    "email_label": "Alamat Email",
    "email_cannot_change": "*Alamat email tidak dapat diubah.",
    "edit_profile": "Ubah Profil",
    "change_password": "Ubah Kata Sandi",
    "save_changes": "Simpan Perubahan",
    "saving": "Menyimpan...",
    "member_since": "Bergabung sejak",
    "status": "Status",
    "active": "Aktif",
    "name_cannot_empty": "Nama tidak boleh kosong",
    "profile_updated": "Profil berhasil diperbarui!",
    "profile_update_failed": "Gagal memperbarui profil",
    "upload_image": "Harap unggah file gambar",
    "image_size_limit": "Ukuran gambar harus kurang dari 5MB",
    "profile_picture_updated": "Foto profil berhasil diperbarui!",
    "image_upload_failed": "Gagal mengunggah gambar",
    "verification_code_sent": "Kode verifikasi telah dikirim ke email Anda!",
    "sending_code": "Mengirim Kode...",
    "enter_full_name": "Masukkan nama lengkap Anda",
    
    // Settings Page
    "settings_title": "Pengaturan",
    "notifications": "Notifikasi",
    "display_language": "Tampilan & Bahasa",
    "advanced_account": "Akun Lanjutan",
    "notification_settings": "Pengaturan Notifikasi",
    "email_notifications": "Notifikasi Email",
    "email_notifications_desc": "Terima email setiap kali seseorang mengirimkan formulir.",
    "weekly_analytics": "Analitik Mingguan Form",
    "weekly_analytics_desc": "Dapatkan ringkasan mingguan kinerja form Anda.",
    "dashboard_layout": "Tata Letak Dashboard",
    "list_view": "Tampilan Daftar",
    "grid_view": "Tampilan Grid",
    "app_language": "Bahasa Aplikasi",
    "advanced_account_actions": "Tindakan Akun Lanjutan",
    "deactivate_account": "Nonaktifkan Akun Anda",
    "deactivate_account_desc": "Sembunyikan form dan profil Anda untuk sementara. Anda dapat kembali kapan saja.",
    "deactivate": "Nonaktifkan",
    "delete_account_permanent": "Hapus Akun Permanen",
    "delete_account_desc": "Ini akan menghapus semua form dan data Anda selamanya. Tindakan ini tidak dapat dibatalkan.",
    "delete_account": "Hapus Akun",
    "setting_updated": "Pengaturan diperbarui",
    "update_failed": "Gagal memperbarui",
    "deactivate_confirm_title": "Nonaktifkan Akun?",
    "deactivate_confirm_msg": "Apakah Anda yakin ingin menonaktifkan akun Anda? Form Anda akan disembunyikan sampai Anda masuk kembali.",
    "delete_confirm_title": "Hapus Akun Permanen?",
    "delete_confirm_msg": "Tindakan ini tidak dapat dibatalkan. Semua form, respons, dan data Anda akan dihapus permanen.",
    "account_deactivated": "Akun berhasil dinonaktifkan",
    "account_deleted": "Akun berhasil dihapus",
    "deactivate_failed": "Gagal menonaktifkan akun",
    "delete_failed": "Gagal menghapus akun",
    
    // OTP Page
    "forgot_password_title": "Lupa Kata Sandi?",
    "forgot_password_subtitle": "Jangan khawatir! Masukkan email Anda di bawah untuk menerima kode verifikasi.",
    "enter_email": "Masukkan email Anda",
    "sending_code_btn": "Mengirim Kode...",
    "send_reset_link": "Kirim Link Reset",
    "return_to_signin": "Kembali ke Masuk",
    "return_to_profile": "Kembali ke Profil",
    "check_mail": "Cek Email Anda",
    "sent_code_to": "Kami telah mengirim kode 6 digit ke",
    "verify_identity": "Verifikasi Identitas",
    "verifying": "Memverifikasi...",
    "didnt_receive": "Tidak menerima kode?",
    "resend_code": "Kirim Ulang Kode",
    "sending": "Mengirim...",
    "use_different_email": "Gunakan alamat email yang berbeda",
    "otp_sent": "Kode OTP telah dikirim ke email Anda.",
    "otp_resent": "Kode OTP telah dikirim ulang.",
    "otp_invalid": "Email tidak valid",
    "otp_send_failed": "Gagal mengirim OTP",
    "enter_6_digits": "Masukkan 6 digit kode OTP",
    "otp_verified": "OTP terverifikasi! Mengalihkan...",
    "email_not_found": "Email tidak ditemukan",
    
    // Reset Password Page
    "new_password_title": "Kata Sandi Baru",
    "new_password_subtitle": "Buat kata sandi yang kuat untuk mengamankan akun Anda.",
    "update_password": "Perbarui Kata Sandi",
    "updating": "Memperbarui...",
    "back_to_signin": "Kembali ke Masuk",
    "back_to_profile": "Kembali ke Profil",
    "password_changed": "Kata sandi Anda telah berhasil diubah",
    "reset_failed": "Reset kata sandi gagal",
    "email_otp_invalid": "Email atau OTP tidak valid.",
    "email_otp_not_found": "Email atau OTP tidak ditemukan.",
    
    // Logout Modal
    "logout_title": "Keluar dari Akun Anda?",
    "logout_confirm": "Apakah Anda yakin ingin keluar?",
    
    // Popup
    "success": "Berhasil!",
    "are_you_sure": "Apakah Anda yakin?",
    "attention": "Perhatian",
    "yes_delete": "Ya, hapus",

    // Landing Page
    "hero_title_1": "Buat, Bagikan, dan",
    "hero_title_2": "Analisis Form",
    "hero_title_3": "dengan Mudah",
    "hero_subtitle": "Arphatra adalah pembuat form generasi berikutnya yang dirancang untuk tim modern.",
    "get_started": "Mulai Gratis Sekarang",
    "feature_1_title": "Builder Intuitif",
    "feature_1_desc": "Antarmuka seret dan lepas yang dapat dikuasai siapa saja dalam hitungan menit. Tanpa koding.",
    "feature_2_title": "Tema Kustom",
    "feature_2_desc": "Buat form Anda terlihat persis seperti yang Anda inginkan dengan kustomisasi tema kami yang kuat.",
    "feature_3_title": "Analitik Real-time",
    "feature_3_desc": "Analisis jawaban Anda dengan grafik bawaan yang indah dan ekspor data dengan mudah.",
    "privacy": "Privasi",
    "terms": "Ketentuan",
    "contact": "Kontak",
    "all_rights": "Seluruh hak cipta dilindungi.",

    // View Form
    "loading_form": "Memuat Form...",
    "form_not_found": "Form tidak ditemukan",
    "submit_required_alert": "Harap jawab semua pertanyaan wajib.",
    "submit_success": "Jawaban berhasil dikirim!",
    "submit_failed": "Gagal mengirim jawaban",
    "clear_form": "Kosongkan Form",
    "form_cleared_msg": "Form dikosongkan",
    "back": "Kembali",
    "next": "Lanjut",
    "submit": "Kirim",
    "page_of": "Halaman {current} dari {total}"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("English (US)");

  useEffect(() => {
    const initLang = async () => {
      try {
        const user = getUser();
        if (user) {
            const res = await apiRequest("/users/settings");
            if (res.data?.display?.language) {
                setLanguage(res.data.display.language);
            }
        }
      } catch (error) {
        console.error("Failed to load language", error);
      }
    };
    initLang();
  }, []);

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
