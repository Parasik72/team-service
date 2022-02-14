
const JOIN_THE_TEAM = 'Join the team';
const LEAVE_THE_TEAM = 'Leave the team';
const MOVE_TO_ANOTHER_TEAM = 'Move to another team';
const MANAGER_POST = 'Manager post';

export type TeamRequestType = typeof JOIN_THE_TEAM 
                            | typeof LEAVE_THE_TEAM 
                            | typeof MOVE_TO_ANOTHER_TEAM 
                            | typeof MANAGER_POST;

export const TeamRequestTypes = {
    JOIN_THE_TEAM,
    LEAVE_THE_TEAM,
    MOVE_TO_ANOTHER_TEAM,
    MANAGER_POST
}

const AWAITING = 'Awaiting';
const ACCEPTED = 'Accepted';
const DECLINED = 'Declined';

export type TeamRequestStatusType = typeof AWAITING 
                                    | typeof ACCEPTED 
                                    | typeof DECLINED;

export const TeamRequestStatusTypes = {
    AWAITING,
    ACCEPTED,
    DECLINED
}
