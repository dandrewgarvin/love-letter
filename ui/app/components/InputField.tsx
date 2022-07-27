const InputField = ({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  disabled?: boolean;
}) => {
  return (
    <div className='input-field'>
      <label htmlFor={label}>{label}</label>
      <input
        type='text'
        id={label}
        value={value}
        onChange={event => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default InputField;
