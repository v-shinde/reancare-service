import { TestLoader } from "../test.loader";
import { BiometricsHeightMapper } from "../test.data.mapper/biometrics.height.ehr.mapper";
import { PatientMapper } from '../test.data.mapper/patient.ehr.mapper';
import { DoctorMapper } from '../test.data.mapper/doctor.ehr.mapper';


describe('Observation resource: Storage, retrieval', () => {
    it('Given biometrics height domain model, store observation resource to fhir interface, then returned biometrics height details are valid.', async () => {

        var patientModel = PatientMapper.convertJsonObjectToDomainModel();
        var patientEhrId = await TestLoader.PatientStore.create(patientModel);

        var doctorModel = DoctorMapper.convertJsonObjectToDomainModel();
        var doctorEhrId = await TestLoader.DoctorStore.create(doctorModel);
        
        var model = BiometricsHeightMapper.convertJsonObjectToDomainModel();
        model.EhrId = patientEhrId;
        model.RecordedByUserId = doctorEhrId;

        var biometricsHeightEhirId = await TestLoader.BiometricsHeightStore.add(model);
        var biometricsHeightFhirResource = await TestLoader.BiometricsHeightStore.getById(biometricsHeightEhirId);

        //Assertions

        var extractedPatientEhrId = biometricsHeightFhirResource.subject.reference.split('/')[1];
        expect(extractedPatientEhrId).toEqual(model.EhrId);

        var extractedUnit = biometricsHeightFhirResource.component[0].valueQuantity.unit;
        expect(extractedUnit).toEqual(model.Unit);

        var extractedRecordDate = biometricsHeightFhirResource.effectiveDateTime;
        expect(extractedRecordDate).toEqual(model.RecordDate);

        var extractedRecordedByEhrId = biometricsHeightFhirResource.performer[0].reference.split('/')[1];
        expect(extractedRecordedByEhrId).toEqual(model.RecordedByUserId);

        var extractedBiometricsHeight = biometricsHeightFhirResource.component[0].valueQuantity.value;
        expect(extractedBiometricsHeight).toEqual(model.BodyHeight);


        // For now just check if Visit Id exists
        var extractedVisitId = biometricsHeightFhirResource.id;
        expect(extractedVisitId).toBeTruthy();

    });
});
