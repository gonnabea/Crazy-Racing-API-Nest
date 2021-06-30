import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { v4 as UUID } from 'uuid';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { FindByEmailInput, FindByEmailOutput } from './dtos/find-user.dto';
import { GetAllUsersOutput } from './dtos/get-all-user.dto';
import { User } from './entities/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly user: ReturnModelType<typeof User>,
  ) {}
  async findAll(): Promise<GetAllUsersOutput> {
    try {
      const users = await this.user.find();
      if (users.length > 0) {
        console.log(users);
        return {
          ok: true,
          users,
        };
      } else {
        return {
          ok: false,
          error: 'There are no users yet / 아직 등록된 유저가 없습니다.',
        };
      }
    } catch {
      return {
        ok: false,
        error:
          'Error Occurs trying get all user list. / 유저 리스트 조회 중 오류가 발생했습니다.',
      };
    }
  }

  // jwt login의 과정으로 실행됨
  async findByEmail({ email }: FindByEmailInput): Promise<FindByEmailOutput> {
    const user = await this.user.findOne({ email });
    return user;
  }

  // auth.resolver에 제공
  async createUser(
    createUserInput: CreateUserInput,
  ): Promise<CreateUserOutput> {
    try {
      const user = await this.user.findOne({ email: createUserInput.email });
      console.log(user);
      // 입력된 이메일로 가입한 유저가 있는 지 판별.
      if (user) {
        return {
          ok: false,
          error:
            "Error: There's already an User with that Email. 해당 이메일로 가입한 유저가 이미 있습니다.",
        };
      }

      if (createUserInput) {
        await this.user.create(createUserInput);
        return {
          ok: true,
          userData: createUserInput,
        };
      } else {
        return {
          ok: false,
          error: 'No User Data sent.',
        };
      }
    } catch {
      return {
        ok: false,
        error: 'Error Occured.',
      };
    }
  }
}