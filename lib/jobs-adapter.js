export class NullJobsAdapter {
  async findSaferRoles() { return []; }
}

export function getJobsAdapter() {
  return new NullJobsAdapter();
}
