import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.scss";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "success"
  | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsAnchorProps = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

const buildClassName = ({
  variant,
  size,
  iconOnly,
  fullWidth,
  className,
  disabled,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}) =>
  [
    "app-button",
    `app-button--${variant}`,
    `app-button--${size}`,
    iconOnly ? "app-button--icon-only" : "",
    fullWidth ? "app-button--full-width" : "",
    disabled ? "is-disabled" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

const renderContent = ({
  loading,
  leftIcon,
  rightIcon,
  children,
}: Pick<BaseButtonProps, "loading" | "leftIcon" | "rightIcon" | "children">) => (
  <>
    {loading ? (
      <span className="app-button__spinner" aria-hidden="true" />
    ) : leftIcon ? (
      <span className="app-button__icon" aria-hidden="true">
        {leftIcon}
      </span>
    ) : null}
    {children ? <span className="app-button__label">{children}</span> : null}
    {rightIcon ? (
      <span className="app-button__icon-right" aria-hidden="true">
        {rightIcon}
      </span>
    ) : null}
  </>
);

const Button = (props: ButtonProps) => {
  const {
    variant = "primary",
    size = "md",
    iconOnly = false,
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
    children,
  } = props;

  if ("href" in props && props.href) {
    const { href, disabled, ...anchorProps } = props;
    return (
      <a
        {...anchorProps}
        href={href}
        aria-disabled={disabled || loading}
        className={buildClassName({
          variant,
          size,
          iconOnly,
          fullWidth,
          className,
          disabled: disabled || loading,
        })}
        onClick={(event) => {
          if (disabled || loading) {
            event.preventDefault();
            return;
          }
          anchorProps.onClick?.(event);
        }}
      >
        {renderContent({ loading, leftIcon, rightIcon, children })}
      </a>
    );
  }

  const { disabled, type = "button", ...buttonProps } = props;
  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled || loading}
      className={buildClassName({
        variant,
        size,
        iconOnly,
        fullWidth,
        className,
        disabled: disabled || loading,
      })}
    >
      {renderContent({ loading, leftIcon, rightIcon, children })}
    </button>
  );
};

export default Button;
