export async function enterPaperMode(): Promise<boolean> {
  const response = await fetch('/api/paper-mode/enter', {
    method: 'POST',
  });

  if (!response.ok) {
    throw response;
  }

  return (await response.json()) as boolean;
}

export async function exitPaperMode(): Promise<boolean> {
  const response = await fetch('/api/paper-mode/exit', {
    method: 'POST',
  });

  if (!response.ok) {
    throw response;
  }

  return (await response.json()) as boolean;
}
