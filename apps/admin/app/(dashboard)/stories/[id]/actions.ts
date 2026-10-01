'use server';

import { updateStoryAction as updateAction, deleteStoryAction as deleteAction } from '../actions';

export async function updateStoryAction(id: string, formData: FormData) {
  return updateAction(id, formData);
}

export async function deleteStoryAction(id: string) {
  return deleteAction(id);
}
