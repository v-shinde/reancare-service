import Address from '../models/address.model';
import { AddressDto } from "../../../domain.types/address.domain.types";

///////////////////////////////////////////////////////////////////////////////////

export class AddressMapper {

    static toDto = (address: Address): AddressDto => {
        if(address == null){
            return null;
        }
        var longitude: string = address.Longitude ? address.Longitude.toString() : null;
        var lattitude: string = address.Lattitude ? address.Lattitude.toString() : null;

        var dto: AddressDto = {
            id: address.id,
            Type: address.Type,
            PersonId: address.PersonId,
            OrganizationId: address.OrganizationId,
            AddressLine: address.AddressLine,
            City: address.City,
            District: address.District,
            State: address.State,
            Country: address.Country,
            PostalCode: address.PostalCode,
            Longitude: longitude ? parseFloat(longitude) : null,
            Lattitude: lattitude ? parseFloat(lattitude) : null,
        };
        return dto;
    }

}

