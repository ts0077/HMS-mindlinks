import { Save, Edit2, Trash2, Loader2, Printer, Eye } from "lucide-react";

type ButtonText = {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
};

type SaveButtonProps = {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

// ============================================
// SAVE BUTTON - Primary Action (Compact)
// ============================================

export default function SaveButton({
  text,
  onClick,
  disabled = false,
  loading = false,
}: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-1.5
        px-4 sm:px-5 py-2 sm:py-2
        text-sm font-semibold text-white
        bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
        rounded-lg
        shadow-md shadow-emerald-600/25
        hover:shadow-lg hover:shadow-emerald-600/30
        hover:-translate-y-0.5
        active:translate-y-0 active:scale-[0.98]
        transition-all duration-200 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed 
        disabled:hover:translate-y-0 disabled:hover:shadow-md
        disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        min-h-[40px] sm:min-h-[36px]
        w-full sm:w-auto
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save className="w-3.5 h-3.5" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}

// ============================================
// SAVE CHANGES BUTTON - Update Action (Compact)
// ============================================

export function SaveChangesButton({
  text = "Save Changes",
  onClick,
  disabled = false,
  loading = false,
}: SaveButtonProps & { text?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-1.5
        px-4 sm:px-5 py-2 sm:py-2
        text-sm font-semibold text-white
        bg-gray-900 hover:bg-gray-800 active:bg-black
        rounded-lg
        shadow-md shadow-gray-900/25
        hover:shadow-lg hover:shadow-gray-900/30
        hover:-translate-y-0.5
        active:translate-y-0 active:scale-[0.98]
        transition-all duration-200 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed 
        disabled:hover:translate-y-0 disabled:hover:shadow-md
        disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
        min-h-[40px] sm:min-h-[36px]
        w-full sm:w-auto
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save className="w-3.5 h-3.5" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}

// ============================================
// EDIT BUTTON - Secondary Action (Compact)
// ============================================

export function EditButton({ text, onClick, disabled = false }: ButtonText) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-1.5
        px-3 sm:px-4 py-1.5 sm:py-2
        text-sm font-medium text-white
        bg-gray-700 hover:bg-gray-800 active:bg-gray-900
        rounded-md
        shadow-sm shadow-gray-700/25
        hover:shadow-md hover:shadow-gray-700/30
        hover:-translate-y-0.5
        active:translate-y-0 active:scale-[0.98]
        transition-all duration-200 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed
        disabled:hover:translate-y-0 disabled:hover:shadow-sm
        disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2
        min-h-[36px] sm:min-h-[32px]
      `}
    >
      <Edit2 className="w-3 h-3" />
      <span>{text}</span>
    </button>
  );
}

// ============================================
// DELETE BUTTON - Destructive Action (Compact)
// ============================================

export function DeleteButton({
  text,
  onClick,
  disabled = false,
  loading = false,
}: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-1.5
        px-3 sm:px-4 py-1.5 sm:py-2
        text-sm font-medium text-white
        bg-red-600 hover:bg-red-700 active:bg-red-800
        rounded-md
        shadow-sm shadow-red-600/25
        hover:shadow-md hover:shadow-red-600/30
        hover:-translate-y-0.5
        active:translate-y-0 active:scale-[0.98]
        transition-all duration-200 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed
        disabled:hover:translate-y-0 disabled:hover:shadow-sm
        disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        min-h-[36px] sm:min-h-[32px]
        w-full sm:w-auto
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Deleting...</span>
        </>
      ) : (
        <>
          <Trash2 className="w-3 h-3" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}

// ============================================
// PRINT BUTTON - Utility Action (Compact)
// ============================================

export function PrintButton({
  text = "Print",
  onClick,
  disabled = false,
  loading = false,
}: SaveButtonProps & { text?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-1.5
        px-3 sm:px-4 py-1.5 sm:py-2
        text-sm font-medium text-gray-700
        bg-white hover:bg-gray-50 active:bg-gray-100
        border border-gray-300 hover:border-gray-400
        rounded-md
        shadow-sm hover:shadow-md
        hover:-translate-y-0.5
        active:translate-y-0 active:scale-[0.98]
        transition-all duration-200 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed
        disabled:hover:translate-y-0 disabled:hover:shadow-sm
        disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
        min-h-[36px] sm:min-h-[32px]
        w-full sm:w-auto
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Printing...</span>
        </>
      ) : (
        <>
          <Printer className="w-3 h-3" />
          <span>{text}</span>
        </>
      )}
    </button>
  );
}

// ============================================
// VIEW BUTTON - Utility Action (Compact)
// ============================================

export function ViewButton({
  text = "View",
  onClick,
  disabled = false,
  loading = false,
}: SaveButtonProps & { text?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-1.5
        px-3 sm:px-4 py-1.5 sm:py-2
        text-sm font-medium text-blue-700
        bg-blue-50 hover:bg-blue-100 active:bg-blue-200
        border border-blue-200 hover:border-blue-300
        rounded-md
        shadow-sm hover:shadow-md
        hover:-translate-y-0.5
        active:translate-y-0 active:scale-[0.98]
        transition-all duration-200 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed
        disabled:hover:translate-y-0 disabled:hover:shadow-sm
        disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        min-h-[36px] sm:min-h-[32px]
        w-full sm:w-auto
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <div className="flex items-center justify-center gap-1">

          <Eye className="w-3 h-3" />
          <span>{text}</span>
        </div>
      )}
    </button>
  );
}