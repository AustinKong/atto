import { AddButton } from './AddButton';
import { DeleteButton } from './DeleteButton';
import { Item } from './Item';
import { Label } from './Label';
import { List } from './List';
import { Marker } from './Marker';
import { Root } from './Root';

/**
 * `SortableListInput` is a compound component for managing draggable, sortable
 * lists of inputs integrated with React Hook Form and dnd-kit.
 *
 * Users provide their own input components (Textarea, Input, etc.) for maximum flexibility.
 * Use `useSortableListInput` and `useSortableListInputItem` hooks to access form context.
 *
 * @example
 * // Simple string array with inline functions
 * interface FormData {
 *   skills: string[];
 * }
 *
 * const { control, register } = useForm<FormData>({
 *   defaultValues: { skills: "" }
 * });
 *
 * <SortableListInput.Root<FormData>
 *   control={control}
 *   register={register}
 *   name="skills"
 *   defaultItem=""
 * >
 *   <HStack justify="space-between">
 *     <SortableListInput.Label>Skills</SortableListInput.Label>
 *     <SortableListInput.AddButton />
 *   </HStack>
 *
 *   <SortableListInput.List>
 *     <SortableListInput.Item<FormData>>
 *       {({ index, name, register}) => (
 *         <>
 *           <SortableListInput.Marker />
 *           <Textarea {...register(`${name}.${index}`)} placeholder="Enter skill..." />
 *           <SortableListInput.DeleteButton />
 *         </>
 *       )}
 *     </SortableListInput.Item>
 *   </SortableListInput.List>
 * </SortableListInput.Root>
 *
 * @example
 * // Complex object array with multiple fields and metadata
 * interface PersonItem {
 *   name: string;
 *   gender: 'male' | 'female' | 'other';
 *   metadata: string | null;
 * }
 *
 * interface FormData {
 *   people: PersonItem[];
 * }
 *
 * const { control, register } = useForm<FormData>({
 *   defaultValues: { people: [{ name: 'Bob', gender: 'other', metadata: 'Some metadata' }] }
 * });
 *
 * <SortableListInput.Root<FormData>
 *   control={control}
 *   register={register}
 *   name="people"
 *   defaultItem={{ name: '', gender: 'other', metadata: null }}
 * >
 *   <HStack justify="space-between">
 *     <SortableListInput.Label>People</SortableListInput.Label>
 *     <SortableListInput.AddButton />
 *   </HStack>
 *
 *   <SortableListInput.List>
 *     <ListItem />
 *   </SortableListInput.List>
 * </SortableListInput.Root>
 *
 * function ListItem() {
 *   const { register, name, control } = useSortableListInput<FormData>();
 *   const { index } = useSortableListInputItem();
 *
 *   return (
 *     <SortableListInput.Item<FormData>>
 *       <SortableListInput.Marker>
 *         <Avatar.Root size="sm">
 *           <Avatar.Fallback name={personName || 'Person'} />
 *         </Avatar.Root>
 *       </SortableListInput.Marker>
 *       <Input {...register(`${name}.${index}.name`)} placeholder="Person name" />
 *       <Controller
 *         control={control}
 *         name={`${name}.${index}.gender`}
 *         render={({ field }) => {
 *           return (
 *             <Select.Root
 *               name={field.name}
 *               value={field.value}
 *               onValueChange={({ value }) => field.onChange(value)}
 *               onInteractOutside={() => field.onBlur()}
 *               collection={genderCollection}
 *             >
 *               <Select.HiddenSelect />
 *               <Select.Control>
 *                 <Select.Trigger />
 *               </Select.Control>
 *               <Portal>
 *                 <Select.Positioner>
 *                   <Select.Content>
 *                     {genderCollection.items.map((item) => (
 *                       <Select.Item key={item.value} item={item} />
 *                     ))}
 *                   </Select.Content>
 *               </Select.Positioner>
 *             </Portal>
 *           </Select.Root>
 *         )}}
 *       />
 *       <Text>Metadata: {watch(`${name}.${index}.metadata`)}</Text>
 *       <SortableListInput.DeleteButton />
 *     </SortableListInput.Item>
 *   );
 * }}
 *
 * @note Do not manually map over the items array. The List component handles rendering
 * and mapping internally. Just provide the Item component as a child of List.
 *
 * @note Avoid using inline functions for heavy list items to prevent unnecessary re-renders.
 *
 * @template TFieldValues - The shape of the entire form state.
 */
export const SortableListInput = {
  AddButton,
  DeleteButton,
  Marker,
  Item,
  Label,
  List,
  Root,
};

export type { SortableListInputContextValue, SortableListInputItemContextValue } from './contexts';
export { useSortableListInput, useSortableListInputItem } from './contexts';
