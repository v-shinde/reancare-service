import { CareplanActivityDomainModel } from '../../../../../modules/careplan/domain.types/activity/careplan.activity.domain.model';
import { CareplanActivity } from '../../../../../modules/careplan/domain.types/activity/careplan.activity.dto';
import { ParticipantDto } from '../../../../../modules/careplan/domain.types/participant/participant.dto';
import { ApiError } from '../../../../../common/api.error';
import { Logger } from '../../../../../common/logger';
import { EnrollmentDomainModel } from "../../../../../modules/careplan/domain.types/enrollment/enrollment.domain.model";
import { EnrollmentDto } from "../../../../../modules/careplan/domain.types/enrollment/enrollment.dto";
import { ICareplanRepo } from "../../../../repository.interfaces/careplan/enrollment.repo.interface";
import { EnrollmentMapper } from "../../mappers/careplan/enrollment.mapper";
import Enrollment from "../../models/careplan/enrollment.model";
import Participant from "../../../../../database/sql/sequelize/models/careplan/participant.model";
import CareplanArtifact from "../../../../../database/sql/sequelize/models/careplan/careplan.artifact.model";
import { uuid } from '../../../../../domain.types/miscellaneous/system.types';
import { CareplanArtifactMapper } from '../../mappers/careplan/artifact.mapper';
import { Op } from 'sequelize';

///////////////////////////////////////////////////////////////////////

export class CareplanRepo implements ICareplanRepo {

    addPatientWithProvider = async (
        patientUserId: string,
        provider: string,
        participantId: string
    ): Promise<ParticipantDto> => {
        try {
            const entity = {
                UserId        : patientUserId,
                Provider      : provider,
                ParticipantId : participantId,
            };
            const participant = await Participant.create(entity);
            return participant;
        } catch (error) {
            Logger.instance().log(error.message);
            return null;
        }
    };

    getPatientRegistrationDetails = async (patientUserId: string, provider: string): Promise<ParticipantDto> => {
        try {
            var participant = await Participant.findOne({
                where : {
                    UserId   : patientUserId,
                    Provider : provider,
                },
            });
            return participant;
        } catch (error) {
            Logger.instance().log(error.message);
        }
    };

    enrollPatient = async (model: EnrollmentDomainModel): Promise<EnrollmentDto> => {
        try {
            const entity = {
                UserId        : model.UserId,
                Provider      : model.Provider,
                ParticipantId : model.ParticipantId,
                EnrollmentId  : model.EnrollmentId,
                PlanCode      : model.PlanCode,
                PlanName      : model.PlanName,
                StartDate     : model.StartDate,
                EndDate       : model.EndDate,
                Gender        : model.Gender,
            };
            const enrollment = await Enrollment.create(entity);
            return await EnrollmentMapper.toDto(enrollment);
        } catch (error) {
            Logger.instance().log(error.message);
            throw new ApiError(500, error.message);
        }
    };

    getPatientEnrollments = async (patientUserId: string): Promise<EnrollmentDto[]> => {
        try {
            const enrollments = await Enrollment.findAll({
                where : {
                    UserId : patientUserId
                }
            });
            const enrollmentDtos = enrollments.map(x => {
                return EnrollmentMapper.toDto(x);
            });
            return enrollmentDtos;
        } catch (error) {
            Logger.instance().log(error.message);
            throw new ApiError(500, error.message);
        }
    }

    getPatientEnrollment = async (
        patientUserId: string, provider: string, enrollmentId: any): Promise<EnrollmentDto> => {
        try {
            var enrollment = await Enrollment.findOne({
                where : {
                    UserId       : patientUserId,
                    Provider     : provider,
                    EnrollmentId : enrollmentId
                },
            });
            return EnrollmentMapper.toDto(enrollment);
        } catch (error) {
            Logger.instance().log(error.message);
        }
    }

    addActivities = async (
        provider: string,
        planName: string,
        planCode: string,
        patientUserId: uuid,
        enrollmentId: string,
        activities: CareplanActivityDomainModel[]): Promise<CareplanActivity[]> => {
        try {

            var activityEntities = [];

            activities.forEach(activity => {
                var entity = {
                    Provider         : provider,
                    PlanName         : planName,
                    PlanCode         : planCode,
                    EnrollmentId     : enrollmentId,
                    UserId           : patientUserId,
                    Type             : activity.Type,
                    ProviderActionId : activity.ProviderActionId,
                    Title            : activity.Title,
                    ScheduledAt      : activity.ScheduledAt,
                    Sequence         : activity.Sequence,
                    Frequency        : activity.Frequency,
                    Status           : activity.Status
                };
                activityEntities.push(entity);
            });
            
            const records = await CareplanArtifact.bulkCreate(activityEntities);

            var dtos = [];
            records.forEach(async (task) => {
                var dto = await CareplanArtifactMapper.toDto(task);
                dtos.push(dto);
            });
            return dtos;
        } catch (error) {
            Logger.instance().log(error.message);
        }
    }

    addActivity = async (
        provider: string,
        planName: string,
        planCode: string,
        patientUserId: uuid,
        enrollmentId: string,
        activity: CareplanActivityDomainModel): Promise<CareplanActivity> => {
        try {
            var entity = {
                Provider         : provider,
                PlanName         : planName,
                PlanCode         : planCode,
                EnrollmentId     : enrollmentId,
                UserId           : patientUserId,
                Type             : activity.Type,
                ProviderActionId : activity.ProviderActionId,
                Title            : activity.Title,
                ScheduledAt      : activity.ScheduledAt,
                Sequence         : activity.Sequence,
                Frequency        : activity.Frequency,
                Status           : activity.Status
            };
            const record = await CareplanArtifact.create(entity);
            var dto = await CareplanArtifactMapper.toDto(record);
            return dto;
        } catch (error) {
            Logger.instance().log(error.message);
        }
    }

    getActivities = async (patientUserId: string, startTime: Date, endTime: Date): Promise<CareplanActivity[]> => {
        try {
            const orderByColum = 'ScheduledAt';
            const order = 'ASC';

            const foundResults = await CareplanArtifact.findAndCountAll({
                where : {
                    UserId      : patientUserId,
                    ScheduledAt : {
                        [Op.gte] : startTime,
                        [Op.lte] : endTime,
                    }
                },
                order : [[orderByColum, order]]
            });
            const dtos: CareplanActivity[] = [];
            for (const activity of foundResults.rows) {
                const dto = CareplanArtifactMapper.toDto(activity);
                dtos.push(dto);
            }

            // const searchResults = {
            //     TotalCount     : foundResults.count,
            //     RetrievedCount : dtos.length,
            //     Order          : order === 'ASC' ? 'ascending' : 'descending',
            //     OrderedBy      : orderByColum,
            //     Items          : dtos,
            // };

            return dtos;
        } catch (error) {
            Logger.instance().log(error.message);
        }
    }

    getActivity = async (activityId: uuid): Promise<CareplanActivity> => {
        try {
            const record = await CareplanArtifact.findByPk(activityId);
            return CareplanArtifactMapper.toDto(record);
        } catch (error) {
            Logger.instance().log(error.message);
        }
    }

}