
import { ProfileInformationForm } from "./ProfileInformationForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { SubscriptionDetails } from "./SubscriptionDetails";

export function ProfileForm() {
  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden px-1">
      <ProfileInformationForm />
      <SubscriptionDetails />
      <PasswordChangeForm />
    </div>
  );
}
