
import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { CareplanActivity } from "../domain.types/activity/careplan.activity";
import { CareplanActivityDetails } from "../domain.types/activity/careplan.activity.details.dto";
import { EnrollmentDomainModel } from "../domain.types/enrollment/enrollment.domain.model";
import { ParticipantDomainModel } from "../domain.types/participant/participant.domain.model";

////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface ICareplanService {

    init(): Promise<boolean>;

    providerName(): string;

    registerPatient(patientDetails: ParticipantDomainModel): Promise<string>;

    enrollPatientToCarePlan(enrollmentDetails: EnrollmentDomainModel): Promise<string>;

    fetchActivities(
        careplanCode: string,
        enrollmentId: string,
        fromDate: Date,
        toDate: Date): Promise<CareplanActivity[]>;
    
    getActivity(
            patientUserId: uuid,
            careplanCode: string,
            enrollmentId: string,
            activityId: string,
            scheduledAt: Date,
            sequence: number
        ): Promise<CareplanActivityDetails>;

    updateActivity(
            patientUserId: uuid,
            careplanCode: string,
            enrollmentId: string,
            activityId: string,
            updates: any
        ): Promise<CareplanActivity>;

}
