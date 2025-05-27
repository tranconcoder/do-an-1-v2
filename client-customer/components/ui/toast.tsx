"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

const MUTATION_LISTENERS = new Map<string, ((data: any) => void)[]>();

type ActionType = "ADD" | "REMOVE" | "UPDATE";

type Action = {
  type: ActionType;
  toast: ToastProps; // Assuming ToastProps is defined elsewhere or correctly imported/used above
};

interface State {
  toasts: ToastProps[]; // Assuming ToastProps is defined
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD":
      // Add new toast, respecting a potential limit (e.g., 1)
      // This basic reducer just adds. Limit logic is better in the hook/Toaster.
      return { toasts: [...state.toasts, action.toast] };
    case "REMOVE":
      return { toasts: state.toasts.filter(t => t.id !== action.toast.id) };
    case "UPDATE":
      return { toasts: state.toasts.map(t => t.id === action.toast.id ? action.toast : t) };
    default:
      return state;
  }
};

const subscribe = (callback: (state: State) => void) => {
  const listenerId = `listener_${Math.random().toString(36).substr(2, 9)}`;
  if (!MUTATION_LISTENERS.has("stateChange")) {
    MUTATION_LISTENERS.set("stateChange", []);
  }
  MUTATION_LISTENERS.get("stateChange")?.push(callback);

  return () => {
    const listeners = MUTATION_LISTENERS.get("stateChange");
    if (listeners) {
      MUTATION_LISTENERS.set("stateChange", listeners.filter(listener => listener !== callback));
    }
  };
};

const emit = (data: State) => {
  MUTATION_LISTENERS.get("stateChange")?.forEach(listener => listener(data));
};

let state: State = { toasts: [] }; // Initialize state

const dispatch = (action: Action) => {
  state = reducer(state, action);
  emit(state);
};

type ToastArgs = Omit<ToastProps, 'id'> & { id?: string }; // Assuming ToastProps is defined correctly

const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>(state.toasts);

  React.useEffect(() => {
    const unsubscribe = subscribe(newState => {
      setToasts(newState.toasts);
    });

    return unsubscribe;
  }, []);

  const toast = (props: ToastArgs) => {
    const id = props.id || `toast-${Math.random().toString(36).substr(2, 9)}`;
    // Ensure the passed props include necessary fields like title, description, etc.
    // This cast might be necessary if ToastProps definition is strict
    dispatch({ type: "ADD", toast: { ...props, id } as ToastProps });

    // Set a timer to remove the toast if duration is specified
    if (props.duration !== Infinity) {
       setTimeout(() => {
           dispatch({ type: "REMOVE", toast: { id } as ToastProps }); // Only id is needed for removal action
       }, props.duration || 5000); // Default duration 5s
    }
    return { id };
  };

  return { toasts, toast };
};

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  useToast,
}
