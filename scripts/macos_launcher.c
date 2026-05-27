#include <errno.h>
#include <libgen.h>
#include <mach-o/dyld.h>
#include <spawn.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>
#include <unistd.h>

extern char **environ;

static void escape_applescript_string(
  const char *input,
  char *output,
  size_t output_size
) {
  size_t out_index = 0;

  for (
    size_t in_index = 0;
    input[in_index] != '\0' && out_index + 1 < output_size;
    in_index++
  ) {
    if ((input[in_index] == '"' || input[in_index] == '\\') && out_index + 2 < output_size) {
      output[out_index++] = '\\';
    }

    output[out_index++] = input[in_index];
  }

  output[out_index] = '\0';
}

int main(void) {
  char executable_path[4096];
  uint32_t executable_path_size = sizeof(executable_path);

  if (_NSGetExecutablePath(executable_path, &executable_path_size) != 0) {
    fprintf(stderr, "Atto launcher path is too long.\n");
    return 1;
  }

  char resolved_path[4096];
  if (realpath(executable_path, resolved_path) == NULL) {
    fprintf(stderr, "Unable to resolve Atto launcher path: %s\n", strerror(errno));
    return 1;
  }

  char directory_buffer[4096];
  snprintf(directory_buffer, sizeof(directory_buffer), "%s", resolved_path);

  char atto_path[4096];
  snprintf(atto_path, sizeof(atto_path), "%s/Atto.bin", dirname(directory_buffer));

  char escaped_atto_path[8192];
  escape_applescript_string(atto_path, escaped_atto_path, sizeof(escaped_atto_path));

  char terminal_command[9000];
  snprintf(
    terminal_command,
    sizeof(terminal_command),
    "do script quoted form of POSIX path \"%s\"",
    escaped_atto_path
  );

  char *const argv[] = {
    "osascript",
    "-e",
    "tell application \"Terminal\"",
    "-e",
    "activate",
    "-e",
    terminal_command,
    "-e",
    "end tell",
    NULL,
  };

  pid_t pid;
  int status = posix_spawnp(&pid, "osascript", NULL, NULL, argv, environ);
  if (status != 0) {
    fprintf(stderr, "Unable to open Atto in Terminal: %s\n", strerror(status));
    return 1;
  }

  waitpid(pid, NULL, 0);
  return 0;
}
