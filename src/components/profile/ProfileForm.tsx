
import { ProfileInformationForm } from "./ProfileInformationForm";
import { PasswordChangeForm } from "./PasswordChangeForm";

export function ProfileForm() {
  return (
    <div className="space-y-6">
      <ProfileInformationForm />
      <PasswordChangeForm />
    </div>
  );
}
