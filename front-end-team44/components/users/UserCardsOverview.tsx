import { User } from '@types'

type Props = {
  users: User[]
}

const UserCardsOverview: React.FC<Props> = ({ users }: Props) => {

  return (
    <>
      <section className="mt-5">
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Green</th>
              <th scope="col">Yellow</th>
              <th scope="col">Red</th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.length > 0 &&
              users.map((user, index) => (
                <tr key={index}>
                  <td>
                    {user.name}
                  </td>
                  <td>
                    {user.greenCards}
                  </td>
                  <td>
                    {user.yellowCards}
                  </td>
                  <td>
                    {user.redCards}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </>
  )
}

export default UserCardsOverview