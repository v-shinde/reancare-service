import { IAddressRepo } from '../../../repository.interfaces/address.repo.interface';
import Address from '../models/address.model';
import { Op, Sequelize } from 'sequelize';
import { AddressDomainModel, AddressDto, AddressSearchFilters, AddressSearchResults } from '../../../domain.types/address.domain.types';
import { AddressMapper } from '../mappers/address.mapper';
import { Logger } from '../../../../common/logger';
import { ApiError } from '../../../../common/api.error';

///////////////////////////////////////////////////////////////////////

export class AddressRepo implements IAddressRepo {
    
    create = async (addressDomainModel: AddressDomainModel): Promise<AddressDto> => {
        try {
            var entity = {
                Type: addressDomainModel.Type,
                UserId: addressDomainModel.PersonId ?? null,
                OrganizationId: addressDomainModel.OrganizationId ?? null,
                AddressLine: addressDomainModel.AddressLine ?? null,
                City: addressDomainModel.City ?? null,
                District: addressDomainModel.District ?? null,
                State: addressDomainModel.State ?? null,
                Country: addressDomainModel.Country ?? null,
                PostalCode: addressDomainModel.PostalCode ?? null,
                Longitude: addressDomainModel.Longitude ?? null,
                Lattitude: addressDomainModel.Lattitude ?? null,
            };
            var address = await Address.create(entity);
            var dto = await AddressMapper.toDto(address);
            return dto;
        } catch (error) {
            Logger.instance().log(error.message);
            throw new ApiError(500, error.message);
        }
    };

    getById = async (id: string): Promise<AddressDto> => {
        try {
            var address = await Address.findByPk(id);
            var dto = await AddressMapper.toDto(address);
            return dto;
        } catch (error) {
            Logger.instance().log(error.message);
            throw new ApiError(500, error.message);
        }
    };

    getByPersonId = async (personId: string): Promise<AddressDto[]> => {
        try {
            var dtos = [];
            var addresses = await Address.findAll({ where: { id: personId } });
            for(var address of addresses) {
                var dto = await AddressMapper.toDto(address);
                dtos.push(dto);
            }
            return dtos;
        } catch (error) {
            Logger.instance().log(error.message);
            throw new ApiError(500, error.message);
        }
    };

    search = async (filters: AddressSearchFilters): Promise<AddressSearchResults> => {
        try {

            var search = { where: { } };

            if(filters.Type != null) {
                search.where['Type'] = { [Op.like]: '%' + filters.Type + '%' };
            }
            if(filters.PersonId != null) {
                search.where['PersonId'] = filters.PersonId;
            }
            if(filters.OrganizationId != null) {
                search.where['OrganizationId'] = filters.OrganizationId;
            }
            if(filters.AddressLine != null) {
                search.where['AddressLine'] = { [Op.like]: '%' + filters.AddressLine + '%' };
            }
            if(filters.City != null) {
                search.where['City'] = { [Op.like]: '%' + filters.City + '%' };
            }            
            if(filters.District != null) {
                search.where['District'] = { [Op.like]: '%' + filters.District + '%' };
            }
            if(filters.State != null) {
                search.where['State'] = { [Op.like]: '%' + filters.State + '%' };
            }
            if(filters.Country != null) {
                search.where['Country'] = { [Op.like]: '%' + filters.Country + '%' };
            }
            if(filters.PostalCode != null) {
                search.where['PostalCode'] = { [Op.like]: '%' + filters.PostalCode + '%' };
            }
            if(filters.LongitudeFrom != null && filters.LongitudeTo != null) {
                search.where['Longitude'] = { 
                    [Op.gte]: filters.LongitudeFrom,
                    [Op.lte]: filters.LongitudeTo,
                };
            }
            if(filters.LattitudeFrom != null && filters.LattitudeTo != null) {
                search.where['Lattitude'] = { 
                    [Op.gte]: filters.LattitudeFrom,
                    [Op.lte]: filters.LattitudeTo,
                };
            }
            if(filters.CreatedDateFrom != null && filters.CreatedDateTo != null) {
                search.where['CreatedAt'] = { 
                    [Op.gte]: filters.CreatedDateFrom,
                    [Op.lte]: filters.CreatedDateTo,
                };
            }
            else if(filters.CreatedDateFrom == null && filters.CreatedDateTo != null) {
                search.where['CreatedAt'] = { 
                    [Op.lte]: filters.CreatedDateTo,
                };
            }
            else if(filters.CreatedDateFrom != null && filters.CreatedDateTo == null) {
                search.where['CreatedAt'] = { 
                    [Op.gte]: filters.CreatedDateFrom,
                };
            }
            if(filters.PostalCode != null) {
                search.where['PostalCode'] = { [Op.like]: '%' + filters.PostalCode + '%' };
            }

            var orderByColum = 'AddressLine';
            if (filters.OrderBy) {
                orderByColum = filters.OrderBy;
            }
            var order = 'ASC';
            if (filters.Order == 'descending') {
                order = 'DESC';
            }
            search['order'] = [[orderByColum, order]];

            var limit = 25;
            if(filters.ItemsPerPage) {
                limit = filters.ItemsPerPage;
            }
            var offset = 0;
            var pageIndex = 0;
            if(filters.PageIndex) {
                pageIndex = filters.PageIndex < 0 ? 0 : filters.PageIndex;
                offset = pageIndex * limit;
            }
            search['limit'] = limit;
            search['offset'] = offset;

            var foundResults = await Address.findAndCountAll(search);
            
            var dtos: AddressDto[] = [];
            for(var address of foundResults.rows) {
                var dto = await AddressMapper.toDto(address);
                dtos.push(dto);
            }

            var searchResults: AddressSearchResults = {
                TotalCount: foundResults.count,
                PageIndex: pageIndex,
                ItemsPerPage: limit,
                Order: order === 'DESC' ? 'descending' : 'ascending',
                OrderedBy: orderByColum,
                Items: dtos
            }
            
            return searchResults;

        } catch (error) {
            Logger.instance().log(error.message);
            throw new ApiError(500, error.message);
        }
    };

    update = async (id: string, addressDomainModel: AddressDomainModel): Promise<AddressDto> => {
        try {
            var address = await Address.findByPk(id);

            if(addressDomainModel.Type != null) {
                address.Type = addressDomainModel.Type;
            }
            if(addressDomainModel.PersonId != null) {
                address.PersonId = addressDomainModel.PersonId;
            }
            if(addressDomainModel.OrganizationId != null) {
                address.OrganizationId = addressDomainModel.OrganizationId;
            }
            if(addressDomainModel.AddressLine != null) {
                address.AddressLine = addressDomainModel.AddressLine;
            }
            if(addressDomainModel.City != null) {
                address.City = addressDomainModel.City;
            }
            if(addressDomainModel.District != null) {
                address.District = addressDomainModel.District;
            }
            if(addressDomainModel.State != null) {
                address.State = addressDomainModel.State;
            }
            if(addressDomainModel.Country != null) {
                address.Country = addressDomainModel.Country;
            }
            if(addressDomainModel.PostalCode != null) {
                address.PostalCode = addressDomainModel.PostalCode;
            }
            if(addressDomainModel.Longitude != null) {
                address.Longitude = addressDomainModel.Longitude;
            }
            if(addressDomainModel.Lattitude != null) {
                address.Lattitude = addressDomainModel.Lattitude;
            }
            await address.save();

            var dto = await AddressMapper.toDto(address);
            return dto;
        } catch (error) {
            Logger.instance().log(error.message);
            throw new ApiError(500, error.message);
        }
    }

    delete = async (id: string): Promise<boolean> => {
        try {
            await Address.destroy({ where: { id: id } });
            return true;
        } catch (error) {
            Logger.instance().log(error.message);
            throw new ApiError(500, error.message);
        }
    };

}
