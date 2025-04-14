import { Ionicons } from "@expo/vector-icons";

export const icon = {
  index: (props: any) => (
    <Ionicons name="git-commit-sharp" size={28} color={"white"} {...props} />
  ),
  word: (props: any) => (
    <Ionicons name="unlink" size={28} color={"white"} {...props} />
  ),

  sentence: (props: any) => (
    <Ionicons name="filter" size={28} color={"white"} {...props} />
  ),
};
