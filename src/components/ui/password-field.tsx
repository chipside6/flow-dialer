// src/components/ui/password-field.tsx
import * as React from "react"

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, ...props }, ref) => {
    return (
      <div>
        <label htmlFor={props.id}>{label}</label>
        <input
          {...props}
          ref={ref}
          type="password"
          className="border p-2 rounded"
        />
      </div>
    )
  }
)

PasswordField.displayName = "PasswordField"

export default PasswordField
