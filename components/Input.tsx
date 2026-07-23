import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SharedProps = {
  label: string;
  id: string;
  className?: string;
  hint?: string;
};

type InputProps = SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
    as?: "input";
  };

type TextareaProps = SharedProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className"> & {
    as: "textarea";
  };

export default function Input(props: InputProps | TextareaProps) {
  const { label, id, className, hint, as = "input", ...rest } = props;

  return (
    <div className={cn("ui-field", className)}>
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          className="ui-input ui-input--textarea"
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          className="ui-input"
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint ? <p className="ui-hint">{hint}</p> : null}
    </div>
  );
}
