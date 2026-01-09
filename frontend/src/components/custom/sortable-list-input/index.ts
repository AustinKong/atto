import { AddButton } from './AddButton';
import { DeleteButton } from './DeleteButton';
import { Input } from './Input';
import { Item } from './Item';
import { Label } from './Label';
import { List } from './List';
import { Marker } from './Marker';
import { Root } from './Root';

/**
 * `SortableListInput` is a compound component for managing draggable, sortable
 * lists of inputs integrated with React Hook Form and dnd-kit.
 *
 * @example
 * interface FormData {
 *   favouriteAnimals: { value: string; reference: string }[];
 * }
 *
 * const { control, register } = useForm<FormData>({
 *   defaultValues: { favouriteAnimals: [{ value: "", reference: "" }] }
 * });
 * // Note: The 'reference' field can only be changed via direct manipulation
 * // from React Hook Form or initialized as a default value. Only value is changeable by the user.
 *
 * <SortableListInput.Root<FormData>
 *   control={control}
 *   register={register}
 *   name="favouriteAnimals"
 * >
 *   <HStack justify="space-between">
 *     <SortableListInput.Label>Favourite Animals</SortableListInput.Label>
 *     <SortableListInput.AddButton />
 *   </HStack>
 *
 *   <SortableListInput.List>
 *     <SortableListInput.Item<FormData>
 *       onMouseEnter={(item) => console.log(item.value, item.reference)}
 *     >
 *       // To use a custom drag handle icon, pass it as children:
 *       // Defaults to PiDot icon if no children provided.
 *       <SortableListInput.Marker>
 *         <CustomIcon />
 *       </SortableListInput.Marker>
 *       <SortableListInput.Input placeholder="Enter animal..." />
 *       <SortableListInput.DeleteButton />
 *     </SortableListInput.Item>
 *   </SortableListInput.List>
 * </SortableListInput.Root>
 *
 * @example
 * // Custom layout with multiple fields per row (Avatar marker + Input + Select)
 * interface PersonItem {
 *   name: string;
 *   gender: 'male' | 'female' | 'other';
 * }
 *
 * interface FormData {
 *   people: PersonItem[];
 * }
 *
 * function ListItem() {
 *   const { register, name, control } = useSortableListInput<FormData>();
 *   const { index } = useSortableListInputItem();
 *   const personName = useWatch({ control, name: `${name}.${index}.name` });
 *
 *   return (
 *     <SortableListInput.Item<FormData>>
 *       <SortableListInput.Marker>
 *         <Avatar.Root size="sm">
 *           <Avatar.Fallback name={personName || 'Person'} />
 *         </Avatar.Root>
 *       </SortableListInput.Marker>
 *       <Input {...register(`${name}.${index}.name`)} placeholder="Person name" />
 *       <Select.Root size="sm" collection={genderCollection}>
 *         <Select.Control>
 *           <Select.Trigger />
 *         </Select.Control>
 *         <Select.Content>
 *           {genderCollection.items.map((item) => (
 *             <Select.Item key={item.value} item={item} />
 *           ))}
 *         </Select.Content>
 *       </Select.Root>
 *       <SortableListInput.DeleteButton />
 *     </SortableListInput.Item>
 *   );
 * }
 *
 * function PeopleForm() {
 *   const { control, register } = useForm<FormData>({
 *     values: {
 *       people: [
 *         { name: 'Alice', gender: 'female' },
 *         { name: 'Bob', gender: 'male' },
 *       ],
 *     },
 *   });
 *
 *   return (
 *     <SortableListInput.Root<FormData>
 *       control={control}
 *       register={register}
 *       name="people"
 *       defaultItem={{ name: '', gender: 'other' }}
 *     >
 *       <HStack justify="space-between">
 *         <SortableListInput.Label>People</SortableListInput.Label>
 *         <SortableListInput.AddButton />
 *       </HStack>
 *       <SortableListInput.List>
 *         <ListItem />
 *       </SortableListInput.List>
 *     </SortableListInput.Root>
 *   );
 * }
 *
 * @note Do not manually map over the items array. The List component handles rendering
 * and mapping internally. Just provide the Item component as a child of List.
 *
 * @note When building custom field layouts, use the `useSortableListInput` and
 * `useSortableListInputItem` hooks to access form context and item metadata (index, isDragging).
 *
 * @template TFieldValues - The shape of the entire form state.
 */
export const SortableListInput = {
  AddButton,
  DeleteButton,
  Marker,
  Input,
  Item,
  Label,
  List,
  Root,
};

export type { SortableListInputContextValue, SortableListInputItemContextValue } from './contexts';
export { useSortableListInput, useSortableListInputItem } from './contexts';
