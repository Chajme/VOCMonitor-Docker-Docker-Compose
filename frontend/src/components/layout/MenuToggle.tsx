interface MenuToggleProps {
  onClick: () => void;
}

/** The hamburger shown below 1024px (same markup as the old templates). */
export default function MenuToggle({ onClick }: MenuToggleProps) {
  return (
    <div
      aria-label="Toggle navigation"
      className="menu-toggle"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <i className="material-icons md-light">menu</i>
    </div>
  );
}
