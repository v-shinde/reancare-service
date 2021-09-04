import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    IsUUID,
    PrimaryKey,
    Length,
    ForeignKey,
    BelongsTo,
    IsDate,
    IsInt } from 'sequelize-typescript';

import { v4 } from 'uuid';
import User from '../user.model';
import Person from '../person.model';

///////////////////////////////////////////////////////////////////////

@Table({
    timestamps      : true,
    modelName       : 'HeartPoints',
    tableName       : 'daily_records_heart_points',
    paranoid        : true,
    freezeTableName : true
})
export default class DailyRecordsHeartPoints extends Model {

    @IsUUID(4)
    @PrimaryKey
    @Column({
        type         : DataType.UUID,
        defaultValue : () => { return v4(); },
        allowNull    : false
    })
    id: string;

    @IsUUID(4)
    @ForeignKey(() => Person)
    @Column({
        type      : DataType.UUID,
        allowNull : true,
    })
    PersonId: string;

    @BelongsTo(() => Person)
    Person: Person;

    @IsUUID(4)
    @ForeignKey(() => User)
    @Column({
        type      : DataType.UUID,
        allowNull : true,
    })
    PatientUserId: string;

    @IsInt
    @Column({
        type         : DataType.INTEGER,
        allowNull    : false,
        defaultValue : 0,
        validate     : {
            min : 0
        }
    })
    HeartPoints: number;

    @Length({ max: 8 })
    @Column({
        type         : DataType.STRING(8),
        allowNull    : false,
        defaultValue : 'points'
    })
    Unit: string;

    @IsDate
    @Column({
        type      : DataType.DATE,
        allowNull : true
    })
    RecordDate: Date;

    @Column
    @CreatedAt
    CreatedAt: Date;

    @UpdatedAt
    UpdatedAt: Date;

    @DeletedAt
    DeletedAt: Date;

}
