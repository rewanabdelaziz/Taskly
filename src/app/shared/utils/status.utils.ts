import { Status } from "../../features/tasks/models/task";

const STATUS_CLASS_MAP: Record<Status, string> = {
  IN_PROGRESS: 'bg-primary',
  DONE: 'bg-success',
  BLOCKED: 'bg-error',
  IN_REVIEW: 'bg-slate-medium',
  READY_FOR_QA: 'bg-amber-500',
  REOPENED: 'bg-rose-500',
  READY_FOR_PRODUCTION: 'bg-cyan-500',
  TO_DO : 'bg-[#94A3B8]'
};

export function getStatusBgClass(status: Status): string {
  if (!status) return '';
  return STATUS_CLASS_MAP[status] ?? '';
}