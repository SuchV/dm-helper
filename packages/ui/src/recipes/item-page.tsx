import type { VariantProps } from "class-variance-authority";
import { ChevronLeft } from "lucide-react";

import type { badgeVariants } from "../badge";
import type { ButtonProps } from "../button";
import { Badge } from "../badge";
import { Button } from "../button";
import { Spinner } from "../spinner";

interface BaseProps {
  children?: React.ReactNode;
}

export const Content = ({ children }: BaseProps) => {
  return (
    <div className="mx-auto grid w-full max-w-[59rem] flex-1 auto-rows-max gap-4">
      {children}
    </div>
  );
};

export const BackButton = () => {
  return (
    <Button variant="outline" size="icon" className="h-7 w-7">
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Back</span>
    </Button>
  );
};

export const Title = ({ children }: BaseProps) => {
  return (
    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
      {children}
    </h1>
  );
};

interface StatusBadgeProps extends BaseProps {
  statusVariant?: VariantProps<typeof badgeVariants>["variant"];
}

export const StatusBadge = ({ children, statusVariant }: StatusBadgeProps) => (
  <Badge variant={statusVariant} className="ml-auto sm:ml-0">
    {children}
  </Badge>
);

export const ContentHeader = ({ children }: BaseProps) => {
  return <div className="flex items-center gap-4">{children}</div>;
};

interface ActionButtonProps extends ButtonProps {
  pending?: boolean;
}

export const ActionButton = ({
  pending,
  children,
  ...props
}: ActionButtonProps) => {
  const childrenWithPending = pending ? (
    <>
      <Spinner />
      {children}
    </>
  ) : (
    children
  );
  return (
    <Button disabled={pending} size="sm" {...props}>
      {childrenWithPending}
    </Button>
  );
};

export const ContentHeaderActions = ({ children }: BaseProps) => {
  return (
    <div className="hidden items-center gap-2 md:ml-auto md:flex">
      {children}
    </div>
  );
};

export const ContentBody = ({ children }: BaseProps) => (
  <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
    {children}
  </div>
);

export const MainColumn = ({ children }: BaseProps) => (
  <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
    {children}
  </div>
);

export const AsideColumn = ({ children }: BaseProps) => (
  <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
    {children}
  </div>
);

// export function Dashboard() {
//   return (
//     <div className="flex min-h-screen w-full flex-col bg-muted/40">
//       <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
//         <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
//           <div className="mx-auto grid max-w-[59rem] flex-1 auto-rows-max gap-4">
//             <div className="flex items-center gap-4">

//             </div>
//             <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
//               <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
//               </div>
//               <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
//                 <Card x-chunk="dashboard-07-chunk-3">
//                   <CardHeader>
//                     <CardTitle>Product Status</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid gap-6">
//                       <div className="grid gap-3">
//                         <Label htmlFor="status">Status</Label>
//                         <Select>
//                           <SelectTrigger id="status" aria-label="Select status">
//                             <SelectValue placeholder="Select status" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="draft">Draft</SelectItem>
//                             <SelectItem value="published">Active</SelectItem>
//                             <SelectItem value="archived">Archived</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card
//                   className="overflow-hidden"
//                   x-chunk="dashboard-07-chunk-4"
//                 >
//                   <CardHeader>
//                     <CardTitle>Product Images</CardTitle>
//                     <CardDescription>
//                       Lipsum dolor sit amet, consectetur adipiscing elit
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid gap-2">
//                       <Image
//                         alt="Product image"
//                         className="aspect-square w-full rounded-md object-cover"
//                         height="300"
//                         src="/placeholder.svg"
//                         width="300"
//                       />
//                       <div className="grid grid-cols-3 gap-2">
//                         <button>
//                           <Image
//                             alt="Product image"
//                             className="aspect-square w-full rounded-md object-cover"
//                             height="84"
//                             src="/placeholder.svg"
//                             width="84"
//                           />
//                         </button>
//                         <button>
//                           <Image
//                             alt="Product image"
//                             className="aspect-square w-full rounded-md object-cover"
//                             height="84"
//                             src="/placeholder.svg"
//                             width="84"
//                           />
//                         </button>
//                         <button className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed">
//                           <Upload className="h-4 w-4 text-muted-foreground" />
//                           <span className="sr-only">Upload</span>
//                         </button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card x-chunk="dashboard-07-chunk-5">
//                   <CardHeader>
//                     <CardTitle>Archive Product</CardTitle>
//                     <CardDescription>
//                       Lipsum dolor sit amet, consectetur adipiscing elit.
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <div></div>
//                     <Button size="sm" variant="secondary">
//                       Archive Product
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//             <div className="flex items-center justify-center gap-2 md:hidden">
//               <Button variant="outline" size="sm">
//                 Discard
//               </Button>
//               <Button size="sm">Save Product</Button>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
